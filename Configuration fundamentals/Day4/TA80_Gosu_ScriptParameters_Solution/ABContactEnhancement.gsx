package libraries
uses gw.api.util.DisplayableException
uses java.util.Date

enhancement ABContactEnhancement : entity.ABContact {

  function upgradeToStrategicPartner() : void {
    if (this.StrategicPartner_Ext == false) {
      this.StrategicPartner_Ext = true
      if (this.CustomerRating_Ext != null)
        this.CustomerRating_Ext = this.CustomerRating_Ext + 10
      else
        this.CustomerRating_Ext = 25
    }
  }

  property get NextCourtesyContact() : DateTime {
    if (this.LastCourtesyContact_Ext == null)
      return null
    else
      return DateTime.CurrentDate.addBusinessDays(180) }


/* Returns true if contact has at least one open FlagEntry*/
   property get IsFlagged() : boolean {
 
     return this.FlagEntries.hasMatch(\ e -> e.IsOpen)

   } // end of property
  

/* Returns true if contact has at least one vendor evaluation
   whose status is unverified or pending.
*/  
   property get HasUnverifiedEvaluations() : boolean {

      var anyUnverifiedEvals = false
      
      for (thisVendorEval in this.VendorEvaluations) {
         if ((thisVendorEval.Status == "unverified") or (thisVendorEval.Status== "pending")) {
            anyUnverifiedEvals = true
         }
      }
      return anyUnverifiedEvals

   } // end of property
  
  
/* This functions deletes all addresses associated to a contact except
   for the current primary address.
*/  
   function deleteSecondaryAddresses() : void {

      for (currentAddress in this.SecondaryAddresses) {  
         this.removeAddress( currentAddress )    
      }
      
   } // end of function  
   

/* This function executes two actions. (1) It notes that the current user viewed the
   given contact. This is used to determine which contact to display if the Contact
   tab is clicked. (2) It creates a history event identifying that the given
   contact was viewed by the current user. (This function does nothing
   if the RecordInHistory-UserViewsOfContacts script parameter is set to false.)
*/   
   function recordContactViewed() : void {

   // This function is called from the ABContact location group's afterEnter
   // property. Because it is called from a PCF file, there is no database
   // commit. Therefore, a new bundle must be created so that data can
   // be committed to the database.

      var currentUser = User.util.getCurrentUser()

      // create new bundle
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
       
        // NOTE: The ABContact that the keyword "this" references is not in this new
        // bundle, and any changes made to "this" will not get committed when the
        // new bundle is committed. Therefore, the code must create a copy of the
        // contact that "this" references inside the new bundle and make changes
        // to that copy. This in-the-bundle copy is named contactInNewBundle.

        // Recording view of contact in ViewedContact object            
        var newViewedContact = new ViewedContact()
        var contactInNewBundle = bundle.add(this)
        newViewedContact.ViewedContact = contactInNewBundle
        newViewedContact.ViewingUser = currentUser
           
        if (ScriptParameters.RecordInHistory_UserViewsOfContacts) {

           // Recording view of contact in contact history
           var newEntry = new HistoryEntry()
           newEntry.EventType = "viewed"
           newEntry.Description = currentUser.DisplayName + " viewed this contact."
           contactInNewBundle.addToHistoryEntries(newEntry)

           }  // end if RecordInHistory_UserViewsOfContacts

      // runWithNewBundle() inherently commits the data
      })
       
   } // end of function


/* This functions creates a new contact note associated to the ABContact.
*/
   function addContactNote() : ContactNote {
    
      var newContactNote = new ContactNote()
      this.addToContactNotes(newContactNote)
         
      return newContactNote

   } // end of function  

  /* This function toggles the recommended status of a vendor. If the vendor
   is not recommended (and it has at least one evaluation), then the vendor
   is recommended and the custom "ABContactRecommended" event is added. (This
   event triggers a messaging integration point.) If the vendor is recommended,
   then this function unrecommends the vendor and clears out any profile code
   received from the integration point.
*/
  function toggleVendorRecommendedFlag() : void {

    if (!this.IsVendorRecommended and this.VendorEvaluations.length == 0) {
      throw new DisplayableException(displaykey.Training.NoEvaluations)
    } else {
      var evaluationSum = 0
      for (thisEvaluation in this.VendorEvaluations) {
        evaluationSum = evaluationSum + thisEvaluation.TotalScore
      }
      if (!this.IsVendorRecommended and evaluationSum > 0) {
        // switch flag to recommended and sent evaluations to external vendor
        this.IsVendorRecommended = true
        this.addEvent("ABContactRecommended")
        this.VendorProfileCode = "(pending)"
        gw.transaction.Transaction.getCurrent().commit()
      } else {
        if (this.IsVendorRecommended) {
          // switch flag to not recommended and clear out profile code
          this.IsVendorRecommended = false
          this.VendorProfileCode = null
          gw.transaction.Transaction.getCurrent().commit()
        }
      }
    }
  } // end of function

/* As of ContactManager 7.0, every new contact must have at least one contact tag.
   This functionality is not relevant to TrainingApp, so all references to contact
   tags have been removed from the UI. This method is used when a new contact is
   being created and a default tag is needed (such as the NewContact page's
   beforeCommit property).
*/
function addDefaultTagToNewContact() : void {
  
  var defaultTag = new ABContactTag()
  defaultTag.Type = "claimparty"
  this.addToTags(defaultTag)
  } // end of function    

}
// end ABContactEnhancement enhancement

