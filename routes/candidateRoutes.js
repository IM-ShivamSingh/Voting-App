const express=require('express');
const router=express.Router();
const Candidate=require('./../models/candidate');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const User = require('../models/user');


const checkAdminRole=async(userId)=>{
    try{
        const user=await User.findById(userId);
        return user.role==='admin';
    }catch(err){
        return false;
    }
}
//post route to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'User does not have admin role'})
        }
        const data=req.body;//Assuming the request contains the candidate data
        
        const newCandidate=new Candidate(data); 
        const response=await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})


router.put('/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'User does not have admin role'})
        }
        const candidateId=req.params.candidateId;
        const updatedCandidateData=req.body;

        const response=await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new:true,
            runValidators:true,
        })
        if(!response){
            return res.status(404).json({error: 'Candiate not found'})
        }
        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

router.delete('/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'User does not have admin role'})
        }
        const candidateId=req.params.candidateId;
        const response=await Candidate.findByIdAndDelete(candidateId);
        if(!response){
            return res.status(404).json({error: 'Candiate not found'})
        }
        console.log('candidate data deleted');
        res.status(200).json(response);
    }catch(err){ 
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

//voting
router.post('/vote/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    const candidateId=req.params.candidateId;
    const userId=req.user.id;

    try{
        const candidate=await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'});
        }
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        if(user.isVoted){
             res.status(400).json({message: 'you have already voted'})
        }
        if(user.role=='admin'){
            res.status(404).json({message: 'admin is not allowed'})
        }

        //update the candidate document to recored the vote
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted=true;
        await user.save();

        res.status(200).json({message:'vote recorded successfully'});

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})
//vote count
router.get('/vote/count',async(req,res)=>{
    try{
        //find all candidate and sort them by votecount in descending order
        const candidate= await Candidate.find().sort({voteCount:'desc'});
        //mao the candidate to only return their name and votecount
        const voteRecord=candidate.map((data)=>{
            return {
                party: data.party,
                count:data.voteCount
            }
        })

        return res.status(200).json(voteRecord)

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})
router.get('/',async(req,res)=>{
    try{
        const data= await Candidate.find();
        console.log('data fetched');
        res.status(200).json(data);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})
module.exports=router;