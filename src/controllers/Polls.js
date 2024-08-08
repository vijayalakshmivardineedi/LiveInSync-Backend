const Polls = require("../models/Polls");
const mongoose = require('mongoose');

exports.createPolls = async(req, res) =>{
    try {
        const {poll} = req.body;

        const polls = await Polls({
            poll
        });
        await polls.save();
        return res.status(201).json({success:true, message:"Successfully Created"});
    } catch (error) {
        return res.status(401).json({success:false, error});
    }
}

exports.getPolls = async(req, res) => {
    try {
        const poll = await Polls.find().sort({createdAt: -1});
        return res.status(201).json({success:true, poll});
    } catch (error) {
        return res.status(401).json({success:false, error});
    }
}

exports.editPolls = async(req, res) => {
    try {
        const {id} = req.params;
        const updatedFields = { ...req.body };

        const poll = await Polls.findById(id);
        if(!poll){
            return res.status(301).json({success: false, message: "No Match Found"});
        }else{
            const newPoll = await Polls.findByIdAndUpdate(id, {$set: updatedFields}, {new: true});
            return res.status(201).json({success: true, message:"Updated Successfully"})
        }
    } catch (error) {
        return res.status(401).json({success: false, error});
    }
}

exports.deletePolls = async(req, res) => {
    try {
        const {id} = req.params;
        
        const poll = await Polls.findById(id);
        if(!poll){
            return res.status(404).json({success: false, message: "No Match Found"});
        }
        await Polls.findByIdAndDelete(id);
        return res.status(200).json({success: true, message: "Successfully Deleted"})
        
    } catch (error) {
        return res.status(500).json({success: false, error});
    }
}

exports.createPollVotes = async (req, res) => {
    try {
        const { userId, pollId, selectedOption } = req.body; 
        console.log(userId, pollId, selectedOption)

        // Check if the poll ID is valid
        const isValidPoll = mongoose.Types.ObjectId.isValid(pollId);
        if (!isValidPoll) {
            return res.status(400).json({ success: false, message: "Invalid poll ID" });
        }

        // Check if the user has already voted in this poll
        const existingVote = await Polls.findOne({ 'poll.votes.userId': userId, _id: pollId });
        if (existingVote) {
            return res.status(409).json({ success: false, message: "You have already voted in this poll" });
        }

        // Find the poll by ID
        const poll = await Polls.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, message: "Poll not found" });
        }

        // Check if the poll's date and time have passed
        const currentDate = new Date();
        const pollDate = new Date(poll.poll.date);
        const pollTime = poll.poll.time;
        const [hours, minutes] = pollTime.split(':').map(Number);
        pollDate.setHours(hours, minutes);

        if (currentDate > pollDate) {
            return res.status(400).json({ success: false, message: "Time up for the polling." });
        }

        // Save the user's vote
        poll.poll.votes.push({ userId, selectedOption });
        await poll.save();

        return res.status(201).json({ success: true, message: "Successfully voted, thank you!" });

    } catch (error) {
        console.error("Error creating poll vote:", error);
        return res.status(500).json({ success: false, message: "Error creating poll vote", error: error.message });
    }
};

exports.getVoteCount = async (req, res) => {
    try {
        const pollId  = req.params.id;

        // Check if the poll ID is valid
        const isValidPoll = mongoose.Types.ObjectId.isValid(pollId);
        if (!isValidPoll) {
            return res.status(400).json({ success: false, message: "Invalid poll ID" });
        }

        // Find the poll by ID
        const poll = await Polls.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, message: "Poll not found" });
        }

        // Initialize an object to store vote counts for each option
        const voteCounts = {};

        // Count the occurrences of each option
        poll.poll.votes.forEach(vote => {
            const option = vote.selectedOption;
            if (voteCounts[option]) {
                voteCounts[option]++;
            } else {
                voteCounts[option] = 1;
            }
        });

        return res.status(200).json({ success: true, voteCounts });

    } catch (error) {
        console.error("Error getting vote count:", error);
        return res.status(500).json({ success: false, message: "Error getting vote count", error: error.message });
    }
};