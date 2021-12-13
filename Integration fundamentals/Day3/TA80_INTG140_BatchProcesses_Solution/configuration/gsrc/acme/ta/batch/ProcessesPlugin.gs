package acme.ta.batch

uses gw.plugin.processing.IProcessesPlugin
uses gw.processes.BatchProcess
uses acme.ta.batch.legalreport.FlagOverdueLegalReportsBatch
uses acmelab.ta.batch.abdoctor.FlagSpecialtyDoctorsBatch

class ProcessesPlugin implements IProcessesPlugin {
  construct() {
  }
  override function createBatchProcess(type : BatchProcessType, arguments : Object[]) : BatchProcess {
    switch(type) {
      case BatchProcessType.TC_FLAGOVERDUELEGALREPORTS:
        return new FlagOverdueLegalReportsBatch()
      case BatchProcessType.TC_FLAGDOCTORNOSPECIALTY:
        return new FlagSpecialtyDoctorsBatch()        
      default:
        return null
    }
  }
}

