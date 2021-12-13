package acme.cc.plugin.policy
uses acme.cc.plugin.policy.legacypolicywsc.policyapi.types.complex.PASHomeownersPolicySummary
uses gw.api.util.TypecodeMapperUtil

class Homeowners {

//                                 ======================
//                                 ====    SEARCH    ====
//                                 ======================

  static function searchForHomeownersPolicies ( criteria : PolicySearchCriteria ) : 
                                                            PolicySearchResultSet {

    // convert criteria to semicolon-delimited list of name/value pairs
    var searchCriteriaAsString = convertSearchCriteriaToString(criteria)
  
    // create API object
    var pasAPI = new acme.cc.plugin.policy.legacypolicywsc.policyapi.PolicyAPI()
    pasAPI.Config.Http.Authentication.Basic.Username = "su" /* Normally you wouldn't use su for security reasons */
    pasAPI.Config.Http.Authentication.Basic.Password = "gw"

    // get results from PAS using the web service API
    var searchResults = pasAPI.searchForHomeownersPolicies(searchCriteriaAsString)

    // create return entity
    var resultsToReturn = new PolicySearchResultSet()    
    
    // map web service object data to instances of PolicySummaries
    // (even though we do not search on address, we want address data to
    // appear in the search results)    
    for (currentResult in searchResults) {
       var newSummary = new PolicySummary()      
       newSummary.PolicyType     = "Homeowners"
       newSummary.PolicyNumber   = currentResult.PolicyNumber
       newSummary.InsuredName    = currentResult.InsuredName      
       newSummary.Address        = currentResult.StreetLine1
       newSummary.City           = currentResult.City    
       newSummary.State          = currentResult.State                                                                                                    
       newSummary.PostalCode     = currentResult.PostalCode
       newSummary.EffectiveDate  = currentResult.EffectiveFrom      
       newSummary.ExpirationDate = currentResult.EffectiveTo 
       newSummary.Status         = "inforce"
       resultsToReturn.addToSummaries(newSummary)               
      }    
        
      return resultsToReturn
    }
 
  private static function convertSearchCriteriaToString (criteria : PolicySearchCriteria) : String {

    // For education purposes, searches are done only on the policy type,
    // policy number, loss date, and insursed name          
    var returnString : String = ""
    if (criteria.PolicyType != null)         returnString = returnString + "PolicyType," + criteria.PolicyType + ";"   
    if (criteria.PolicyNumber != null)       returnString = returnString + "PolicyNumber," + criteria.PolicyNumber + ";"
    if (criteria.LossDate != null)           returnString = returnString + "LossDate," + criteria.LossDate + ";"
    if ((criteria.FirstName != null) and (criteria.LastName != null)) {
      var insuredName : String = criteria.FirstName + " " + criteria.LastName
      returnString = returnString + "InsuredName," + insuredName + ";"
    }                                         
      
    // remove final ";" if one exists
    if (returnString.length > 0) {
      returnString = gw.api.util.StringUtil.substring(returnString, 0, returnString.length-1)
    }
      
    return returnString
    }

//                                 ========================
//                                 ====    RETRIEVE    ====
//                                 ========================

  static function retrieveHomeownersPolicy ( policyNumber : String, 
                              lossDate : DateTime ) : PolicyRetrievalResultSet {
    
    var pasAPI = new acme.cc.plugin.policy.legacypolicywsc.policyapi.PolicyAPI()
    pasAPI.Config.Http.Authentication.Basic.Username = "ExternalAppUser"
    pasAPI.Config.Http.Authentication.Basic.Password = "gw"
    
    var unparsedXML = pasAPI.retrieveHomeownersPolicy(policyNumber, lossDate)

    var xml = acme.cc.plugin.policy.xsd.pashomeownerspolicymodel.
                                                     PASPolicy.parse(unparsedXML)

    // START MAPPING PAS DATA TO GUIDEWIRE POLICY DATA MODEL

    // Policy-Level Data...
    var aPolicy = new Policy()

    aPolicy.PolicyType      = "Homeowners"    
    aPolicy.PolicyNumber    = xml.PolicyNumber
    aPolicy.EffectiveDate   = xml.EffectiveFrom
    aPolicy.ExpirationDate  = xml.EffectiveTo
    aPolicy.TotalProperties = xml.Locations.$Children.Count

    // Insured Data...
    // all ExternalApp policies have an insured name which consists of first name
    // plus last name, with only one space that separates first name from last name
    var insuredName = xml.PolicyHolder.split(" ")
    var insured = new Person()
    insured.FirstName = insuredName[0]
    insured.LastName = insuredName[1]
    aPolicy.insured = insured
   
    // add insured address info
    var insuredAddress = new Address()     
    insuredAddress.AddressLine1 = xml.PrimaryAddress.StreetLine1    
    insuredAddress.City         = xml.PrimaryAddress.City    
    insuredAddress.State        = xml.PrimaryAddress.State    
    insuredAddress.PostalCode   = xml.PrimaryAddress.PostalCode     
    insured.addAddress( insuredAddress )    

    // Policy-level coverages...
    for (currentPolicyCoverageEntry in xml.PolicyCoverages.$Children) {
      var aPolicyCoverage = new PolicyCoverage()
      // use typecode mapper to convert PAS coverage type to Guidewire coverage type
      aPolicyCoverage.Type = TypecodeMapperUtil.getTypecodeMapper().
            getInternalCodeByAlias("CoverageType", "acme:pas",
            currentPolicyCoverageEntry.Children[0].Text)
      aPolicy.addToCoverages(aPolicyCoverage)         
      }

    // Location data (including buildings, location-based risk units and location-level coverages)...
    for (currentLocationEntry in xml.Locations.$Children index i) {
      var aLocation = new PolicyLocation()
      aLocation.LocationNumber = (i+1) as java.lang.String

      // Address data
      var anAddress = new Address()
      anAddress.AddressLine1 = xml.PrimaryAddress.StreetLine1
      anAddress.City         = xml.PrimaryAddress.City
      anAddress.State        = xml.PrimaryAddress.State
      anAddress.PostalCode   = xml.PrimaryAddress.PostalCode
      anAddress.Description  = currentLocationEntry.Children[0].Text
      aLocation.Address = anAddress
      
      // Building data
      var aBuilding = new Building()
      aBuilding.BuildingNumber = (i+1) as java.lang.String
      aBuilding.PolicyLocation = aLocation
      
      // Building Risk Unit data
      var aBuildingRU = new BuildingRU()
      aBuildingRU.Description = currentLocationEntry.Children[0].Text
      aBuildingRU.RUNumber = i+1
      aBuildingRU.Building = aBuilding
      
      // Property coverage data
      for (currentLocationCoverageEntry in currentLocationEntry.Children[1].Children) {
        var aLocationCoverage = new PropertyCoverage()
      // use typecode mapper to convert PAS coverage type to Guidewire coverage type        
        aLocationCoverage.Type = TypecodeMapperUtil.getTypecodeMapper().
            getInternalCodeByAlias("CoverageType", "acme:pas",
            currentLocationCoverageEntry.Children[0].Text)
        aBuildingRU.addToCoverages(aLocationCoverage)
      } // end property coverage loop
      
      aLocation.addToLocationBasedRisks(aBuildingRU)
      aPolicy.addToRiskUnits(aBuildingRU)
      aPolicy.addToPolicyLocations(aLocation)
    } // end location risk unit loop
   
    // Endorsement Data...
    for (currentEndorsementEntry in xml.EndorsementForms.$Children) {
      var anEndorsement = new Endorsement()
      anEndorsement.Description = currentEndorsementEntry.Children[0].Text
      anEndorsement.FormNumber = currentEndorsementEntry.Children[1].Text
      aPolicy.addToEndorsements(anEndorsement)
    } 
    
    // END MAPPING
   
    var resultSet = new PolicyRetrievalResultSet()
    resultSet.Result = aPolicy
    resultSet.NotUnique = false
    
    return resultSet
    
  }

}
