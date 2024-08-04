const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/campaigns', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('Could not connect to MongoDB', err);
});

// Campaign Schema
const campaignSchema = new mongoose.Schema({
  CampaignName: String,
  FirstEmail: Date,
  FollowUp1: String,
  SecondEmail: Date,
  FollowUp2: String,
  ThirdEmail: Date,
  Closure: String,
  FourthEmail: Date,
  Account: String,
  FirstEmailDoneBy: String,
  SecondEmailDoneBy: String,
  ThirdEmailDoneBy: String,
  FourthEmailDoneBy: String,
  isUpdated: { type: Boolean, default: false },
});

const Campaign = mongoose.model('Campaign', campaignSchema);

// Routes

// Create or update campaign
app.post('/campaign', async (req, res) => {
  const { CampaignName, Account, FirstEmail, FirstEmailDoneBy } = req.body;

  try {
    let campaign = await Campaign.findOne({ CampaignName });

    const oneWeekLater = new Date(FirstEmail);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    const twoWeeksLater = new Date(oneWeekLater);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    const threeWeeksLater = new Date(twoWeeksLater);
    threeWeeksLater.setDate(threeWeeksLater.getDate() + 14);

    if (!campaign) {
      campaign = new Campaign({
        CampaignName,
        Account,
        FirstEmail,
        FollowUp1: `${CampaignName}_FollowUp1`,
        SecondEmail: oneWeekLater,
        FollowUp2: `${CampaignName}_FollowUp2`,
        ThirdEmail: twoWeeksLater,
        Closure: `${CampaignName}_Closure`,
        FourthEmail: threeWeeksLater,
        FirstEmailDoneBy,
      });

      await campaign.save();
    } else {
      campaign.Account = Account;
      campaign.FirstEmail = FirstEmail;
      campaign.FollowUp1 = `${CampaignName}_FollowUp1`;
      campaign.SecondEmail = oneWeekLater;
      campaign.FollowUp2 = `${CampaignName}_FollowUp2`;
      campaign.ThirdEmail = twoWeeksLater;
      campaign.Closure = `${CampaignName}_Closure`;
      campaign.FourthEmail = threeWeeksLater;
      campaign.FirstEmailDoneBy = FirstEmailDoneBy;

      await campaign.save();
    }

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating/updating campaign:', error);
    res.status(500).json({ error: 'Error creating/updating campaign' });
  }
});

// Get all campaigns
app.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Error fetching campaigns' });
  }
});

// Get campaigns due today
app.get('/campaigns-today', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const campaignsDueToday = await Campaign.find({
      $or: [
        { FirstEmail: { $gte: today, $lt: tomorrow } },
        { SecondEmail: { $gte: today, $lt: tomorrow } },
        { ThirdEmail: { $gte: today, $lt: tomorrow } },
        { FourthEmail: { $gte: today, $lt: tomorrow } }
      ]
    });
    res.json(campaignsDueToday.filter(campaign => !campaign.isUpdated));
  } catch (error) {
    console.error('Error fetching campaigns due today:', error);
    res.status(500).json({ error: 'Error fetching campaigns due today' });
  }
});

// Get backlog
app.get('/backlog', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const backlogTasks = await Campaign.find({
      $or: [
        { FirstEmail: { $lt: today } },
        { SecondEmail: { $lt: today } },
        { ThirdEmail: { $lt: today } },
        { FourthEmail: { $lt: today } }
      ]
    });
    res.json(backlogTasks.filter(task => !task.isUpdated));
  } catch (error) {
    console.error('Error fetching backlog tasks:', error);
    res.status(500).json({ error: 'Error fetching backlog tasks' });
  }
});

// Update selected campaigns and set done by
app.post('/update-campaigns', async (req, res) => {
  const { campaignIdsToUpdate, updateName, doneByInputs } = req.body;

  try {
    for (const id of campaignIdsToUpdate) {
      const campaign = await Campaign.findById(id);

      if (campaign) {
        if (campaign.FirstEmail && new Date(campaign.FirstEmail).toDateString() === new Date().toDateString()) {
          campaign.FirstEmailDoneBy = updateName;
          campaign.isUpdated = true;
        }
        if (campaign.SecondEmail && new Date(campaign.SecondEmail).toDateString() === new Date().toDateString()) {
          campaign.SecondEmailDoneBy = updateName;
          campaign.isUpdated = true;
        }
        if (campaign.ThirdEmail && new Date(campaign.ThirdEmail).toDateString() === new Date().toDateString()) {
          campaign.ThirdEmailDoneBy = updateName;
          campaign.isUpdated = true;
        }
        if (campaign.FourthEmail && new Date(campaign.FourthEmail).toDateString() === new Date().toDateString()) {
          campaign.FourthEmailDoneBy = updateName;
          campaign.isUpdated = true;
        }

        await campaign.save();
      }
    }

    res.status(200).json({ message: 'Campaigns updated successfully' });
  } catch (error) {
    console.error('Error updating campaigns:', error);
    res.status(500).json({ error: 'Error updating campaigns' });
  }
});

// Update backlog dates and set done by
app.post('/update-backlog', async (req, res) => {
  const { backlogUpdates, doneByInputs } = req.body;

  try {
    for (const [taskId, newDate] of Object.entries(backlogUpdates)) {
      const campaign = await Campaign.findById(taskId);

      if (campaign) {
        const updatedSecondEmail = new Date(newDate);
        const updatedThirdEmail = new Date(updatedSecondEmail);
        updatedThirdEmail.setDate(updatedThirdEmail.getDate() + 14);
        const updatedFourthEmail = new Date(updatedThirdEmail);
        updatedFourthEmail.setDate(updatedFourthEmail.getDate() + 14);

        campaign.SecondEmail = updatedSecondEmail;
        campaign.SecondEmailDoneBy = doneByInputs[taskId];
        campaign.isUpdated = true;

        // Only update dates for ThirdEmail and FourthEmail without changing doneBy fields
        campaign.ThirdEmail = updatedThirdEmail;
        campaign.FourthEmail = updatedFourthEmail;

        await campaign.save();
      }
    }

    res.status(200).json({ message: 'Backlog updated successfully' });
  } catch (error) {
    console.error('Error updating backlog:', error);
    res.status(500).json({ error: 'Error updating backlog' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
