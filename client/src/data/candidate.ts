import { Candidate } from "../types";  
  
const candidate: Candidate = {
  id: "user001",  
  name: "Suresh Kumar",  
  email: "suresh@example.com",  
  role: "candidate",  
  resumeText: "Backend developer with project experience in Node.js and MongoDB. Built and maintained a hostel management system.",  
  parsedSkills: [],  
  applications: [  
    {  
      jobId: "job001",  
      matchScore: null,  
      aiFeedback: null,  
      status: "applied"  
    }  
  ]  
};  
  
export default candidate;  