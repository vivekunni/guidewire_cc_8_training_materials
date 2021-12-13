package acme.cc.plugin.policy

class AllLOBs {

  static function searchForPolicies ( criteria : PolicySearchCriteria ) : PolicySearchResultSet {

    // The PAS policy search APIs are all LOB-specific. If the user wants to do a
    // search across all LOBs, then one search must be executed for each LOB, and
    // the results must be combined.

    var resultsToReturn = new PolicySearchResultSet()

    var HOresults = acme.cc.plugin.policy.Homeowners.searchForHomeownersPolicies(criteria) 
    for (currentHOresult in HOresults.Summaries) {
      resultsToReturn.addToSummaries(currentHOresult)
    }
    
    var PAresults = acme.cc.plugin.policy.PersonalAuto.searchForPersonalAutoPolicies(criteria)   
    for (currentPAresult in PAresults.Summaries) {
      resultsToReturn.addToSummaries(currentPAresult)
    }
    
    return resultsToReturn
    
  }

}
