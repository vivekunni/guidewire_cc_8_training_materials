package acmelab.ta.batch.abdoctor
uses gw.processes.BatchProcessBase
uses gw.transaction.Transaction
uses gw.api.database.Query

class FlagSpecialtyDoctorsBatch extends BatchProcessBase  {

  construct() {
   super(BatchProcessType.TC_FLAGOVERDUELEGALREPORTS)
  }

  override function doWork() {
      print ("Starting FlagSpecialtyDoctorsBatch batch process")      
      
	  // query doctors	  
      var doctorQuery = Query.make(ABDoctor)
      doctorQuery.compare ("Specialty", Equals, null)
      var resultsObj = doctorQuery.select()
      
      for (currentDoctor in resultsObj) {
        // Do not flag a doctor if already flagged for no specialty.
        if (!currentDoctor.FlagEntries.hasMatch(\ currentEntry -> currentEntry.Reason == "doctor_specialty_unspecified" 
            and currentEntry.IsOpen)) {
              // runWithNewBundle() executes an implicit commit. 
              // No manual commit of the bundle is required.
              Transaction.runWithNewBundle( \ bundle -> {
			        // add doctor to bundle to make writeable
					currentDoctor = bundle.add(currentDoctor)
					
					// make new flag entry
                    var newEntry = new FlagEntry()
                    newEntry.FlagDate = gw.api.util.DateUtil.currentDate()
                    newEntry.Reason = "doctor_specialty_unspecified"
					
					// add flag to doctor 
                    currentDoctor.addToFlagEntries(newEntry)
                   }, "su" )  // end runWithNewBundle()
            }
      }
     print ("Completed FlagSpecialtyDoctorsBatch batch process")
  } // end doWork()
} // end class
