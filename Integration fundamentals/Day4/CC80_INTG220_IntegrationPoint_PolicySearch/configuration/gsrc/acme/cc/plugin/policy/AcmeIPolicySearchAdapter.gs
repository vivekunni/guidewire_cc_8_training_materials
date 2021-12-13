package acme.cc.plugin.policy
uses gw.plugin.policy.search.IPolicySearchAdapter

class AcmeIPolicySearchAdapter implements IPolicySearchAdapter {


  override function searchPolicies(criteria : PolicySearchCriteria) : 
                                              PolicySearchResultSet {

    // create return entity
    var resultsToReturn = new PolicySearchResultSet()  

    // select the searchFor...() method based on the policy type
    switch (criteria.PolicyType) {
        case "Homeowners": resultsToReturn =
            Homeowners.searchForHomeownersPolicies(criteria)
          break
        case "PersonalAuto": resultsToReturn =
            PersonalAuto.searchForPersonalAutoPolicies(criteria)
          break          
        case null : resultsToReturn =
            AllLOBs.searchForPolicies(criteria)
          break
        default:                  
    }
    
    return resultsToReturn
    
  } // end searchPolicies()


  override function retrievePolicyFromPolicySummary(
         policySummary : PolicySummary) : PolicyRetrievalResultSet {

    var resultSet = new PolicyRetrievalResultSet()

    switch (policySummary.PolicyType) {
        case "Homeowners": resultSet = acme.cc.plugin.policy.Homeowners.retrieveHomeownersPolicy(policySummary.PolicyNumber, policySummary.LossDate)
          break
        case "PersonalAuto": resultSet = acme.cc.plugin.policy.PersonalAuto.retrievePersonalAutoPolicy(policySummary.PolicyNumber, policySummary.LossDate)                                           
          break
    }
    
    return resultSet

  } // end retrievePolicy()


  override function retrievePolicyFromPolicy(p0 : Policy) : PolicyRetrievalResultSet {
    return null //## todo: Implement me
  }

  override function retrievePolicySummaryFromPolicy(p0 : Policy) : PolicySummary {
    return null //## todo: Implement me
  }



}
