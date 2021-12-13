package acmelab.ta.messaging.fraud

uses gw.plugin.InitializablePlugin
uses gw.plugin.messaging.MessageTransport
uses java.util.Map
uses gw.api.util.DateUtil
uses trainingapp.demo.messageack.MessageAckUtil
// TODO: CurrDev Update for complete Jira in Drop 3 or Drop 4, see TRAIN-486
class InsuranceFraudTransport implements MessageTransport, InitializablePlugin {

  /**
   * Class private variables
   */
  private var _username : String
  private var _password : String

  /**
   * The input for this method is a Map object that contains name/value pairs representing the names
   * and values passed in from the plugin registry's Parameters table. The setParameters method
   * is called only once, before the first use of the plugin.
   */
  @Param("parameters", "Map object that contains name/value pairs passed in from plugin registry's parameter table")
  override function setParameters(parameters: Map) {
    _username = (parameters.get("username")) as String
    _password = (parameters.get("password")) as String
  }

  /**
   * Method sends the message transformedPayload to ExternalApp's FraudReportAPI. Call
   * the checkForFraudReport(messageID, payload) web service function that returns an integer.
   */
  @Param("aMessage", "Message with SenderrefID")
  @Param("transformedPayload", "Payload transformed in Request Plugin")
  override function send(aMessage: gw.pl.messaging.entity.Message, transformedPayload: String) {
    // connect to ExternalApp FraudReportAPI
    var api = new acmelab.ta.messaging.fraud.fraudreportwsc.fraudreportapi.FraudReportAPI()
    api.Config.Http.Authentication.Basic.Username = _username
    api.Config.Http.Authentication.Basic.Password = _password

    // sending the message payload and receive response code
    var response = api.checkForFraudReport(aMessage.SenderRefID, aMessage.Payload)

    // process synchronous response code
    switch(response) {
      case 1:
      case 2:
        aMessage.reportAck()
        var newNote = new ContactNote()
        newNote.ContactNoteType = typekey.ContactNoteType.TC_GENERAL
        newNote.Subject = "Fraud report request processed"
        newNote.Body = "Fraud report request processed"
        (aMessage.MessageRoot as ABContact).addToContactNotes(newNote)
        var newFlag = new FlagEntry()
        newFlag.Reason = typekey.FlagEntryReason.TC_FRAUDULENT_ACTIVITY
        newFlag.FlagDate = DateUtil.currentDate()
        (aMessage.MessageRoot as ABContact).addToFlagEntries(newFlag)
        break
      case 3:
      case 4:
      case 6:
        MessageAckUtil.reportNonRetryableError(aMessage)
        break
      case 5:
      case 9:
        MessageAckUtil.reportRetryableError(aMessage, typekey.ErrorCategory.TC_DATABASE_CONTENTION)
        break
    }

  }

  override function shutdown() {
  }

  override function suspend() {
  }

  override function resume() {
  }

  override function setDestinationID(p0: int) {
  }

}