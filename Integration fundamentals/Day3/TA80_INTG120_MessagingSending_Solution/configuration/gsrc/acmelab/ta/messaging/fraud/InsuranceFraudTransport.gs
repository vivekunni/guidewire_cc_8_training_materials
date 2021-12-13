package acmelab.ta.messaging.fraud
uses gw.plugin.messaging.MessageTransport
/**
TODO:// CurrDev Solution; remove from build
 */
class InsuranceFraudTransport implements MessageTransport {
  override function send(aMessage: gw.pl.messaging.entity.Message, transformedPayload: String) {
    var api = new acmelab.ta.messaging.fraud.fraudreportwsc.fraudreportapi.FraudReportAPI()
    api.Config.Http.Authentication.Basic.Username = "ExternalAppUser"
    api.Config.Http.Authentication.Basic.Password = "gw"
    api.checkForFraudReport(aMessage.SenderRefID, aMessage.Payload)
    print ("send()")
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