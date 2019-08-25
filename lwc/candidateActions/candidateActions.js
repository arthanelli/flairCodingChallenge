import { LightningElement, api, wire, track} from "lwc";

import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getFieldValue, getRecord } from "lightning/uiRecordApi";
import { updateRecord } from "lightning/uiRecordApi";

import OUTCOME_FIELD from "@salesforce/schema/Candidate__c.Outcome__c";
import REJECTREASON_FIELD from "@salesforce/schema/Candidate__c.RejectReason__c";

export default class CandidateActions extends LightningElement {
  @track reasonText;
  @track showReasonText;
  @track outcomeStatus = '';
  
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: [OUTCOME_FIELD, REJECTREASON_FIELD]})
  candidate;

  get hasReason() {
    return this.reason && !this.showReasonText; 
  }

  get hasOutCome() {
    return this.outcome; 
  }

  get isHired() {
    return this.outcome === "Hired";
  }

  // get isRejected() {
  //   return this.outcome === "Rejected";
  // }

  get outcome() {
    return getFieldValue(this.candidate.data, OUTCOME_FIELD);
  }

  get reason() {
    return getFieldValue(this.candidate.data, REJECTREASON_FIELD);
  }

  hire() {
    this.outcomeStatus = 'Hired';
    this.updateValues();
  }

  reject() {
    this.showReasonText = true;
    this.outcomeStatus = 'Rejected';
  }

  reasonEvent(event){
    this.reasonText = event.target.value;
  }

  saveReason() {
    if(this.reasonText){
      this.updateValues();
      this.showReasonText = false;
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error on data save",
          message: "The Reason is required",
          variant: "error"
        })
      );
    }
  }

  updateValues() {
    let updateValues = {
      fields: {
        Id: this.recordId,
        [OUTCOME_FIELD.fieldApiName]: this.outcomeStatus,
        [REJECTREASON_FIELD.fieldApiName]: this.reasonText,
      },
    };
    
    updateRecord(updateValues)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Record Is Updated",
            variant: "success"
          })
        );
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error on data save",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }
}
