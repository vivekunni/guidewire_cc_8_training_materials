package acme.cc.plugin.policy
uses gw.api.util.TypecodeMapperUtil


class PersonalAuto {

  static function searchForPersonalAutoPolicies ( criteria : PolicySearchCriteria ) : PolicySearchResultSet {

    // concatenate policy holder name if both first and last names are non-null
    var policyHolder : String = null
    if ((criteria.FirstName != null) and (criteria.LastName != null)) {
      policyHolder = criteria.FirstName + " " + criteria.LastName
    }
                                                                
    // create API object
    var pasAPI = new acme.cc.plugin.policy.legacypolicywsc.policyapi.PolicyAPI()
    pasAPI.Config.Http.Authentication.Basic.Username = "su"
    pasAPI.Config.Http.Authentication.Basic.Password = "gw"

    // get results from PAS using the web service API
    var searchResults =
              pasAPI.searchForPersonalAutoPolicies(criteria.PolicyNumber, policyHolder, criteria.LossDate)

    // create return entity
    var resultsToReturn = new PolicySearchResultSet()    
    
    // map web service object data to instances of PolicySummaries
    // (even though we do not search on address, we want address data to
    // appear in the search results)    
    for (currentResult in searchResults) {
       var newSummary = new PolicySummary()      
       newSummary.PolicyType     = "PersonalAuto"
       newSummary.PolicyNumber   = currentResult.PolicyNumber
       newSummary.InsuredName    = currentResult.PrimaryInsured      
       newSummary.Address        = currentResult.StreetLine1
       newSummary.City           = currentResult.City    
       newSummary.State          = currentResult.State                                                                                                    
       newSummary.PostalCode     = currentResult.PostalCode
       newSummary.EffectiveDate  = currentResult.EffectiveStartDate      
       newSummary.ExpirationDate = currentResult.EffectiveEndDate
       newSummary.Status         = "inforce" 
       resultsToReturn.addToSummaries(newSummary)               
      }    
        
      return resultsToReturn
    }

/*  
  static function retrievePersonalAutoPolicy ( policyNumber : String, lossDate : DateTime ) : PolicyRetrievalResultSet {
       
    return new PolicyRetrievalResultSet() 
    
  }
*/
  
  // During the Policy Search lab, leave this code commented out.
  // During the Policy Retrieval lab, you will be told what to do with this code.

  static function retrievePersonalAutoPolicy ( policyNumber : String, lossDate : DateTime ) : PolicyRetrievalResultSet {
      
    var pasAPI = new acme.cc.plugin.policy.legacypolicywsc.policyapi.PolicyAPI()
    pasAPI.Config.Http.Authentication.Basic.Username = "su"
    pasAPI.Config.Http.Authentication.Basic.Password = "gw"
    
    var unparsedXML = pasAPI.retrievePersonalAutoPolicy(policyNumber, lossDate)

    var xml = acme.cc.plugin.policy.xsd.paspersonalautopolicymodel.PASPolicy.parse(unparsedXML)

    // START MAPPING PAS DATA TO GUIDEWIRE POLICY DATA MODEL

    // Policy-Level Data...
    var aPolicy = new Policy()

    aPolicy.PolicyType      = "PersonalAuto"    
    aPolicy.PolicyNumber    = xml.PolicyNumber
    aPolicy.EffectiveDate   = xml.EffectiveFrom
    aPolicy.ExpirationDate  = xml.EffectiveTo
    aPolicy.TotalVehicles   = xml.Vehicles.$Children.Count

    // Insured Data...
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

    // Vehicle data (including vehicles, vehicle risk units and vehicle coverages)...    
    for (currentVehicleEntry in xml.Vehicles.$Children index i) {

      // Vehicle data
      // --> TO DO: create a vehicle object
      var aVehicle = new Vehicle()
      // --> TO DO: set the vehicle's color, year, make, model, and VIN
      aVehicle.Color = currentVehicleEntry.Children[0].Text
      aVehicle.Make = currentVehicleEntry.Children[1].Text
      aVehicle.Model = currentVehicleEntry.Children[2].Text
      aVehicle.Vin = currentVehicleEntry.Children[4].Text
      aVehicle.Year = currentVehicleEntry.Children[5].Text as java.lang.Integer

      // Vehicle Risk Unit data
      // --> TO DO: create a vehicle risk unit object
      var aVehicleRU = new VehicleRU()     
      // --> TO DO: set the vehicle's risk unit number (the first vehicle should be 1, the second 2, and so on)
      aVehicleRU.RUNumber = i+1
      // --> TO DO: associate the vehicle risk unit to the vehicle
      aVehicleRU.Vehicle = aVehicle 

      // Vehicle coverage data 
      for (currentVehicleCoverageEntry in currentVehicleEntry.Children[3].Children) {
        // --> TO DO: create a vehicle coverage object
        var aVehicleCoverage = new VehicleCoverage()
        // --> TO DO: set the vehicle coverage's coverage type using the currentVehicleCoverage's coverage type 
        aVehicleCoverage.Type = TypecodeMapperUtil.getTypecodeMapper().
            getInternalCodeByAlias("CoverageType", "acme:pas",
            currentVehicleCoverageEntry.Children[0].Text)            
        // --> TO DO: associate the vehicle coverage to the vehicle risk unit
        aVehicleRU.addToCoverages(aVehicleCoverage)        
      } // end vehicle coverage loop 

    // --> TO DO: associate the vehicle risk unit to the policy
    aPolicy.addToRiskUnits(aVehicleRU)
    } // end vehicle loop 
   
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
