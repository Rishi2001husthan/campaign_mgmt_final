import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './CampaignsToday.css';

function CampaignsToday() {
    const [campaignsDueToday, setCampaignsDueToday] = useState([]);
    const [backlogTasks, setBacklogTasks] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState({});
    const [updateName, setUpdateName] = useState('');
    const [backlogUpdates, setBacklogUpdates] = useState({});
    const [doneByInputs, setDoneByInputs] = useState({});
    
    useEffect(() => {
        const fetchCampaignsDueToday = async () => {
            try {
                const response = await axios.get('http://localhost:5001/campaigns-today');
                setCampaignsDueToday(response.data);
            } catch (error) {
                console.error('Error fetching campaigns due today:', error);
            }
        };
        fetchCampaignsDueToday();
    }, []);

    useEffect(() => {
        const fetchBacklogTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5001/backlog');
                setBacklogTasks(response.data);
            } catch (error) {
                console.error('Error fetching backlog tasks:', error);
            }
        };
        fetchBacklogTasks();
    }, []);

    const handleCheckboxChange = (event, item) => {
        const isChecked = event.target.checked;
        setSelectedCampaigns(prevSelected => ({
            ...prevSelected,
            [item._id]: isChecked
        }));
    };

    const handleBacklogDateChange = (event, task) => {
        const newDate = event.target.value;
        setBacklogUpdates(prevUpdates => ({
            ...prevUpdates,
            [task._id]: newDate
        }));
    };

    const handleDoneByChange = (event, task) => {
        const doneBy = event.target.value;
        setDoneByInputs(prevInputs => ({
            ...prevInputs,
            [task._id]: doneBy
        }));
    };

    const handleNameUpdate = async () => {
        const campaignIdsToUpdate = Object.keys(selectedCampaigns).filter(id => selectedCampaigns[id]);

        try {
            const response = await axios.post('http://localhost:5001/update-campaigns', {
                campaignIdsToUpdate,
                updateName,
                doneByInputs
            });

            console.log(response.data);

            // Remove updated campaigns from the state
            setCampaignsDueToday(prevCampaigns => prevCampaigns.filter(
                campaign => !campaignIdsToUpdate.includes(campaign._id)
            ));
        } catch (error) {
            console.error('Error updating campaigns:', error);
        }
    };

    const handleBacklogUpdate = async () => {
        try {
            const response = await axios.post('http://localhost:5001/update-backlog', {
                backlogUpdates,
                doneByInputs
            });
            console.log(response.data);
            // Remove updated tasks from the backlog
            setBacklogTasks(prevTasks => prevTasks.filter(
                task => !Object.keys(backlogUpdates).includes(task._id)
            ));
        } catch (error) {
            console.error('Error updating backlog tasks:', error);
        }
    };

    return (
        <div className="campaigns-today">
            <h1>Campaigns Due Today</h1>
            <input
                type="text"
                placeholder="Enter name to update"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                className="update-input"
            />
            <button onClick={handleNameUpdate} className="update-button">Update Names</button>
            <table className="campaigns-table">
                <thead>
                    <tr>
                        <th>Checkbox</th>
                        <th>Campaign Name</th>
                    </tr>
                </thead>
                <tbody>
                    {campaignsDueToday.map(campaign => (
                        <tr key={campaign._id}>
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleCheckboxChange(e, campaign)}
                                />
                            </td>
                            <td>
                                {campaign.FirstEmail && new Date(campaign.FirstEmail).toDateString() === new Date().toDateString() && campaign.CampaignName}
                                {campaign.SecondEmail && new Date(campaign.SecondEmail).toDateString() === new Date().toDateString() && `${campaign.CampaignName}_FollowUp1`}
                                {campaign.ThirdEmail && new Date(campaign.ThirdEmail).toDateString() === new Date().toDateString() && `${campaign.CampaignName}_FollowUp2`}
                                {campaign.FourthEmail && new Date(campaign.FourthEmail).toDateString() === new Date().toDateString() && `${campaign.CampaignName}_Closure`}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h1>Backlog Tasks</h1>
            <button onClick={handleBacklogUpdate} className="update-button">Update Backlog</button>
            <table className="backlog-table">
                <thead>
                    <tr>
                        <th>Checkbox</th>
                        <th>Campaign Name</th>
                        <th>Previous Date</th>
                        <th>New Date</th>
                        <th>Done By</th>
                    </tr>
                </thead>
                <tbody>
                    {backlogTasks.map(task => (
                        <tr key={task._id}>
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleCheckboxChange(e, task)}
                                />
                            </td>
                            <td>
                                {task.CampaignName}_FollowUp1
                            </td>
                            <td>
                                {/* Display previous due date here */}
                                {task.SecondEmail && new Date(task.SecondEmail).toLocaleDateString()}
                            </td>
                            <td>
                                <input
                                    type="date"
                                    value={backlogUpdates[task._id] || ''}
                                    onChange={(e) => handleBacklogDateChange(e, task)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={doneByInputs[task._id] || ''}
                                    onChange={(e) => handleDoneByChange(e, task)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CampaignsToday;
