import { LightningElement,wire,track} from 'lwc';
import getContact from '@salesforce/apex/DataTableController.getContact';
import { updateRecord } from "lightning/uiRecordApi";
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columns = [
    {label:'First Name',fieldName:'FirstName',type:'text',sortable:"true",editable:true},
    {label:'Last Name',fieldName:'LastName',type:'text',sortable:"true"},
    {label:'Phone',fieldName:'Phone',type:'phone',sortable:"true"},
    {label:'Email',fieldName:'Email',type:'email',sortable:"true"}
];
export default class DatatableLWC extends LightningElement {
    columns = columns;

    data;
    error;
    @track sortBy;
    @track sortDirection;
    @track sortdata;
    draftValues = [];

    @wire(getContact)
    contacts(results){
        if(results.data){
            this.data = results.data;
            this.error = undefined;
        }else if(results.error){
            this.data = undefined;
            this.error = results.error;
        }
    }
    //edit value save
    handleSave(event) {
    // Convert datatable draft values into record objects
    this.draftValues = event.detail.draftValues;
    console.log('--- check draft value--',this.draftValues);
    const inputsItems = this.draftValues.slice().map(draft => {
        const fields = Object.assign({}, draft);
        return { fields };
    });

    // Clear all datatable draft values
    //this.draftValues = [];

    try {
      // Update all records in parallel thanks to the UI API
      const promises = inputsItems.map(recordInput => updateRecord(recordInput));
    Promise.all(promises).then(res => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Records Updated Successfully!!',
                variant: 'success'
            })
        );
        this.draftValues = [];
        return refreshApex(this.data);
    }).catch(error => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'An Error Occured!!'+error,
                variant: 'error'
            })
        );
    }).finally(() => {
        this.draftValues = [];
    });

    }catch(error){
        console.log('--- error--',error);
    }
    }


   doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }    

}