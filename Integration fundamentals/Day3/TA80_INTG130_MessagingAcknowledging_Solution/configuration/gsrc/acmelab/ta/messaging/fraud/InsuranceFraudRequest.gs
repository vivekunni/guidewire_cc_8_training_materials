package acmelab.ta.messaging.fraud
uses gw.pl.messaging.entity.Message
uses gw.api.util.DateUtil
uses gw.plugin.messaging.MessageRequest

/**
TODO:// CurrDev Solution; remove from build
 */
class InsuranceFraudRequest implements MessageRequest{

  override function shutdown() {
  }

  override function suspend() {
  }

  override function resume() {
  }

  override function setDestinationID(p0: int) {
  }

  override function beforeSend(aMessage: gw.pl.messaging.entity.Message): String {
    if (aMessage.SenderRefID == null) {
      aMessage.SenderRefID = "fraud-" + aMessage.ID
    }
    print ("before send")
    // beforeSend() must return a payload, whether it was transformed or not
    return aMessage.Payload
  }

  override function afterSend(p0: gw.pl.messaging.entity.Message) {
  }
}