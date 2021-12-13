package acmelab.ta.webservice.company

uses gw.api.database.Query
uses gw.transaction.Transaction
uses gw.xml.ws.annotation.WsiWebService

@WsiWebService
class CompanyAPI {
  /**
   * Method verifies a company by tax ID.
   */
  @Param("taxID", "Company taxID")
  @Returns("Verifies existance of company by tax id. Verification returns true.")
  function doesCompanyExist(taxID: String): boolean {
    // query for Company with given taxID
    var targetCompany = findCompanyByTaxID(taxID)
    if (targetCompany != null) {
      return true
    } else {
      return false
    }
  }

  /**
   * Method that creates a ContactNote for a given company.
   */
  @Param("taxID", "Company taxID")
  @Param("body", "String identifying the body of the note")
  function createContactNote(taxID: String, body: String): void {
    // query for Company with given taxID
    var targetCompany = findCompanyByTaxID(taxID)
    if (targetCompany != null){
      // create new bundle
      Transaction.runWithNewBundle(\newBundle -> {
        // add query read-only object to newBundle
        targetCompany = newBundle.add(targetCompany)
        // create new Note and add to Company
        var newNote = new ContactNote()
        newNote.Body = body
        newNote.ContactNoteType = typekey.ContactNoteType.TC_GENERAL
        newNote.Subject = "External Note"
        targetCompany.addToContactNotes(newNote)
      })
    }
  }

  /**
   * Method takes a tax ID for a company and returns an EmployeeSummary object
   */
  @Param("taxID", "Company tax ID")
  @Returns("EmployeeSummary object")
  function retrieveEmployeeSummaryByCompanyTaxID(taxID: String): EmployeeSummary {
    // query for Company with given taxID
    var targetCompany = findCompanyByTaxID(taxID)
    if (targetCompany != null) {
      var anEmployeeSummary = new EmployeeSummary()
      anEmployeeSummary.EmployeeScore = targetCompany.EmployeeScore
      anEmployeeSummary.NumberOfEmployees = targetCompany.NumberOfEmployees
      anEmployeeSummary.HeadquartersLocation = targetCompany.PrimaryAddress.City
          + ", " + targetCompany.PrimaryAddress.State
          + " " + targetCompany.PrimaryAddress.Country
      return anEmployeeSummary
    } else {
      return null
    }
  }

  //////    Helper Methods    //////

  /**
   * Method takes taxID and returns query result
   */
  @Param("taxID", "Company tax ID")
  @Returns("Finds company by tax id. Returns type ABCompany")
  private function findCompanyByTaxID(taxID: String): ABCompany {
    var queryObj = Query.make(ABCompany)
    queryObj.compare(ABCompany#TaxID, Equals, taxID)
    var resultObj = queryObj.select().AtMostOneRow
    return resultObj
  }
}