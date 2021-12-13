package acmelab.ta.classes

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.system.database.SequenceUtil
uses gw.transaction.Transaction

class ABContactSummary {
  construct(){
    print("ABContactSummary")
  }

  // CurrDev: declare properties using shorthand syntax
  private var _externalID: int as ExternalID
  private var _contactID: String as ContactID
  private var _name: String as Name
  private var _numCheckingAccounts: int as NumCheckingAccounts
  
  /* CurrDev: commented out; uncomment for longhand syntax and remove "as Name" in variable declaration
  property get ExternalID() : int {
    return _externalID
  }
  property set ExternalID(exID : int) {
    _externalID = exID
  }

  property get ContactID() : String {
    return _contactID
  }
  property set ContactID(s : String) {
    _name = s
  } 
 
  property get Name() : String {
    return _name
  }
  property set Name(s : String) {
    _name = s
  } 
 
  property get NumCheckingAccounts() : int {
    return _numCheckingAccounts
  }
  property set NumCheckingAccounts(n : int) {
    _numCheckingAccounts = n
  } 
  END comment out*/

  function initializeExternalID(): void {
    if (_externalID == 0) {
      _externalID = SequenceUtil.next(1000, "externalID") as int
    }
  }

  function loadSummaryData(contact: ABContact): void {
    this._contactID = contact.PublicID
    this._name = contact.DisplayName
    this._numCheckingAccounts = contact.BankAccounts.where(\account -> account.AccountType == "checking").length
  }

  // CurrDev: Add specifically for Gosu for Integration Lab

  function getConcatenatedSummary() : String {
    return _externalID + "," + _contactID + "," + _name + "," + _numCheckingAccounts + "," + _assignedUserWorkload
  }

}
