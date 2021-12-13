package acmelab.ta.webservice.company

uses gw.xml.ws.annotation.WsiExportable

@WsiExportable
final class EmployeeSummary {
  // Create properties get/set syntax in Gosu
  var _numberOfEmployees: int as NumberOfEmployees
  var _employeeScore: int as EmployeeScore
  var _headquartersLocation: String as HeadquartersLocation
}