public with sharing class DataTableController {
    @AuraEnabled(Cacheable=true)
    public static List<Contact> getContact(){
        List<Contact> conList =[SELECT Id,FirstName,LastName,Phone,Email FROM Contact];
        return conList;
        //return [SELECT Id,FirstName,LastName,Phone,Email FROM Contact];
    }
}