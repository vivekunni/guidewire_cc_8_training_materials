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

  // CurrDev:  Added specifically for Queries lab
  private var _assignedUserWorkload : int
  property get AssignedUserWorkload(): int {
    return _assignedUserWorkload
  }

  property set AssignedUserWorkload(workload: int) {
    _assignedUserWorkload = workload
  }
  // End  Queries lab

  function initializeExternalID(): void {
    if (_externalID == 0) {
      _externalID = SequenceUtil.next(1000, "externalID") as int
    }
  }

  function loadSummaryData(contact: ABContact): void {
    this._contactID = contact.PublicID
    this._name = contact.DisplayName
    this._numCheckingAccounts = contact.BankAccounts.where(\account -> account.AccountType == "checking").length
    // CurrDev: Added specifically for Queries lab
    var queryObj = Query.make(ABContact)
    queryObj.compare("AssignedUser", Equals, contact.AssignedUser)
    this._assignedUserWorkload = queryObj.select().Count
    // End Queries lab
  }

  // CurrDev: Add specifically for Queries lab
  function getConcatenatedSummary() : String {
    // added one CSV value
    return _externalID + "," + _contactID + "," + _name + "," + _numCheckingAccounts + "," + _assignedUserWorkload
  }
  // End  Queries lab
  
  // CurrDev: Add specifically for Bundles lab
  function saveSummaryNote(): void {
    if (this._contactID != null) {
      Transaction.runWithNewBundle(\newBundle -> {
        var newNote = new ContactNote()
        newNote.Subject = "ABContact Summary"
        newNote.ContactNoteType = "general"
        newNote.Body = "External ID: " + this._externalID + "\n" +
            "Name: " + this._name + "\n" +
            "Number of checking accounts: " + this._numCheckingAccounts
        var queryObj = Query.make(ABContact)
        queryObj.compare("PublicID", Relop.Equals, this._contactID)
        var targetContact = queryObj.select().AtMostOneRow
        // add targetContact from read-only query results bundle into writeable "newBundle"
        targetContact = newBundle.add(targetContact)
        targetContact.addToContactNotes(newNote)
      }, "su")
    }
  }
  // End bundles lab

}
