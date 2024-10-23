import axios from 'axios';
import React, { useState } from 'react';
import './CampaignForm.css';

function CampaignForm() {
  const [campaignName, setCampaignName] = useState('');
  const [account, setAccount] = useState('');
  const [firstEmail, setFirstEmail] = useState('');
  const [firstEmailDoneBy, setFirstEmailDoneBy] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/campaign', {
        CampaignName: campaignName,
        Account: account,
        FirstEmail: new Date(firstEmail),
        FirstEmailDoneBy: firstEmailDoneBy,
      });

      console.log('Campaign created/updated:', response.data);

      // Clear form fields after successful submission
      
      setCampaignName('');
      setAccount('');
      setFirstEmail('');
      setFirstEmailDoneBy('');
    } catch (error) {
      console.error('Error creating/updating campaign:', error);
    }
  };

  return (
    <div className="campaign-form">
      <h2>Create or Update Campaign</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="campaignName">Campaign Name</label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="account">Account</label>
          <input
            type="text"
            id="account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstEmail">First Email Date</label>
          <input
            type="date"
            id="firstEmail"
            value={firstEmail}
            onChange={(e) => setFirstEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstEmailDoneBy">First Email Done By</label>
          <input
            type="text"
            id="firstEmailDoneBy"
            value={firstEmailDoneBy}
            onChange={(e) => setFirstEmailDoneBy(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CampaignForm;