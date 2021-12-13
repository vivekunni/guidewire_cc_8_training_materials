package acme.cc.plugin.policy
uses gw.api.util.TypecodeMapperUtil

class PersonalAuto {


  static function searchForPersonalAutoPolicies ( criteria : PolicySearchCriteria ) : PolicySearchResultSet {
    
    return new PolicySearchResultSet() 
       
  }
  
  static function retrievePersonalAutoPolicy ( policyNumber : String, lossDate : DateTime ) : PolicyRetrievalResultSet {
       
    return new PolicyRetrievalResultSet() 
    
  }

/*
  
  // During the Policy Search lab, leave this code commented out.
  // During the Policy Retrieval lab, you will be told what to do with this code.

  static function retrievePersonalAutoPolicy ( policyNumber : String, lossDate : DateTime ) : PolicyRetrievalResultSet {
      
    var pasAPI = new acme.cc.plugin.policy.legacypolicywsc.policyapi.PolicyAPI()
    pasAPI.Config.Http.Authentication.Basic.Username = "ExternalAppUser"
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
      // --> TO DO: set the vehicle's color, year, make, model, and VIN

      // Vehicle Risk Unit data
      // --> TO DO: create a vehicle risk unit object
      // --> TO DO: set the vehicle's risk unit number (the first vehicle should be 1, the second 2, and so on)
      // --> TO DO: associate the vehicle risk unit to the vehicle

      // Vehicle coverage data 
      for (currentVehicleCoverageEntry in currentVehicleEntry.Children[3].Children) {
        // --> TO DO: create a vehicle coverage object
        // --> TO DO: set the vehicle coverage's coverage type using the currentVehicleCoverage's coverage type     
        // --> TO DO: associate the vehicle coverage to the vehicle risk unit
      } // end vehicle coverage loop 

    // --> TO DO: associate the vehicle risk unit to the policy
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

*/

}
