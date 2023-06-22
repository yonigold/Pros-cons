import {useState, useEffect} from 'react';
import Head from 'next/head';
import Modal from '../components/Modal';
import { addToWaitlist } from '@/firebase/waitlist';
import { getSubmissionCount, incrementSubmissionCount } from '@/utils/localStorage';
import Footer from '@/components/Footer';
import Title from '@/components/Title';
import axios from 'axios';

export default function Home() {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [question, setQuestion] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [apiResponse, setApiResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [bestOption, setBestOption] = useState(null);
  const [formError, setFormError] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistError, setWaitlistError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  





  function parseResponse(response) {
    const lines = response.split('\n');
    let currentOption = null;
    let currentSection = null;
    const options = {};
    let bestOption = "";
    let isParsedSuccessfully = true;
  
    for (const line of lines) {
      const lowerCaseLine = line.toLowerCase();
      if (lowerCaseLine.startsWith('pros:')) {
        currentSection = 'pros';
        continue;
      } else if (lowerCaseLine.startsWith('cons:')) {
        currentSection = 'cons';
        continue;
      }
  
      const lineWithoutColon = line.replace(':', '');
      if (lineWithoutColon.length < line.length) {
        currentOption = lineWithoutColon.trim();
        options[currentOption] = { pros: [], cons: [] };
        continue;
      } 
      
      if (currentOption !== null && currentSection !== null) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('1.') || trimmedLine.startsWith('2.')) {
          options[currentOption][currentSection].push(trimmedLine.slice(2).trim());
        }
      }
    }
  
    if (Object.keys(options).length === 0 || 
        !options[Object.keys(options)[0]].pros.length || 
        !options[Object.keys(options)[0]].cons.length || 
        (options[Object.keys(options)[1]] && (!options[Object.keys(options)[1]].pros.length || 
        !options[Object.keys(options)[1]].cons.length))) {
      isParsedSuccessfully = false;
    }
  
    return { options, bestOption, isParsedSuccessfully };
  }
  
  
function sanitizeInput(input) {
  return input.replace(/['"]+/g, '');
}

  const handleSubmit =  async (event) => {
    event.preventDefault();

    const sanitizedOptionA = sanitizeInput(optionA);
    const sanitizedOptionB = sanitizeInput(optionB);

    const submissionCount = getSubmissionCount();
    
  
    if (submissionCount >= 3) {
      setModalOpen(true);
      return;
    }
    

    if (!question.trim() || !optionA.trim() || !optionB.trim()) {
      setFormError('Please fill all the fields');
      return;
    } else {
      setFormError('');
    }

    incrementSubmissionCount(); 

    setLoading(true); 
    setBestOption(null);            
    try {
      const result = await axios.post('/api/openai', { question, optionA: sanitizedOptionA, optionB: sanitizedOptionB});
      // console.log(result.data.response);
      const parsedData = parseResponse(result.data.response);
  
      if(!parsedData.isParsedSuccessfully) {
        setApiResponse({originalResponse: result.data.response, isParsedSuccessfully: false});
      } else {
        setApiResponse({options: parsedData.options, isParsedSuccessfully: true});
      }
      // setBestOption(parsedData.bestOption);
      // console.log(parsedData.options);
      // console.log(parsedData.bestOption);
      localStorage.setItem('formSubmitted', 'true');

      const prosAndCons = {
        question: question,
        optionA: optionA,
        optionB: optionB,

    };
    
      const resultDecision = await axios.post('/api/openaiDecesion', prosAndCons);
      // console.log(resultDecision.data.response);
      setBestOption(resultDecision.data.response);
      
      
      

      } catch (error) {
        console.log('Invalid response format', error);
        setFormError('An error occurred. Please try again later.');
        if (error.response) {
          setFormError(`An error occurred, please try again later:`);
          // console.log(error.response.data);
        }  else if (error.request) {
          if (error.code === 'ECONNABORTED') {
            setFormError('The request took too long - please try again later.');
          } else {
          setFormError('No response was received from the server.');
          }
        } else {
          setFormError(`An error occurred, please try again later:`);
          // console.log('Error', error.message);
        }
      } finally {
        setLoading(false);
        setShowResults(true);
        
      }
    }

    const handleWaitlistSubmit = async (event) => {
      event.preventDefault();
      const email = event.target.email.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        setWaitlistError('Please enter your email address.');
        setTimeout(() => {
          setWaitlistError('');
        }, 4000);
        return;
      } else {
        setWaitlistError('');
      }
      try {
        await addToWaitlist(email);
        setWaitlistSuccess(true);
        setTimeout(() => {
            setWaitlistSuccess(false);
            setModalOpen(false);
        }, 2000); // the modal will close after 2 seconds
      } catch (error) {
        console.log(error);
        if (error.message === 'You must wait at least 5 minutes between submissions.') {
          setWaitlistError('You must wait at least 5 minutes between submissions.');
        } else if (error.message === `You're already on the waitlist.`) {
          setWaitlistError('Email already in waitlist');
        } else {
          setWaitlistError('An error occurred. Please try again later.');
        }
        setTimeout(() => {
          setWaitlistError('');
        }, 4000);
    }
  }






  
  
  return (
    <>
    <Head>
      <title>Pros &apos;n Cons</title>
      <meta name="description" content="Have a hard time making decisions? Let AI help you! Simply enter your question and options below and we will do the rest." />
      <meta name='keywords' content='pros and cons, pros n cons, pros and cons generator, pros and cons maker, AI, Decision making, decision maker, decision maker AI, OpenAI, GPT' />
      <meta property="og:title" content="Pros 'n Cons" />
      <meta property="og:description" content="Have a hard time making decisions? Let AI help you! Simply enter your question and options below and we will do the rest." />
      <meta property="og:type" content="website" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
     
      <link rel="icon" href="/favicon.png" />

      </Head>


  

      {/* <button 
  className="px-4 py-2 bg-rose-500 text-white rounded" 
  onClick={() => setModalOpen(true)}
>
Join Waitlist for Full App Experience!
</button> */}

<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
<div className="my-4">
  <h2 className="text-xl font-semibold text-center text-white mb-2">
    Join our waitlist
  </h2>
  <p className="text-md text-center text-white mb-4">
    Be the first to know when our app fully rolls out.
  </p>
  {!waitlistSuccess ? (
    <form className='text-center' onSubmit={handleWaitlistSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="p-2 border rounded w-full md:w-2/3 mx-auto mb-2 rounded-md border border-gray-200 bg-white text-sm shadow-lg font-satoshi font-medium focus:border-black focus:outline-none focus:ring-0"
      />
      <div className="flex justify-center items-center">
        <button type="submit" className="bg-emerald-500 text-white font-semibold py-2 px-3 rounded hover:bg-blue-600 transition duration-200 ">
          Join Waitlist
        </button>
      </div>
      {waitlistError && <p className="text-red-500 text-sm mt-2">{waitlistError}</p>}
    </form>
  ) : (
    <p className="text-green-500 text-sm mt-2 text-center">Thank you for joining our waitlist!</p>
  )}
</div>
  </Modal>

  <header className='relative mt-1 px-4 text-center'>
    <Title />

    {/* Twitter icon (Left Side) */}
    <div className="absolute left-5 top-0 flex items-center">
        <a href="https://twitter.com/yonigold14" target="_blank" rel="noopener noreferrer" className="mt-2 md:mt-5">
            <i className="fab fa-twitter text-black text-3xl"></i>
        </a>
    </div>

    {/* Join The Waitlist button (Right Side) */}
    <div className="absolute right-2 top-3 sm:right-4 sm:top-4 md:right-8 md:top-5 flex items-center">
        <button 
            className="bg-rose-500 text-white text-sm md:text-base rounded-2xl px-2 py-1 md:px-4 md:py-2" 
            onClick={() => setModalOpen(true)}
        >
            Join The Waitlist!
        </button>
        <a href='https://www.buymeacoffee.com/yoni7022'><button 
            className="ml-2 bg-black text-white text-sm md:text-base rounded-2xl px-2 py-1 md:px-4 md:py-2">
              Buy me a coffee ☕
              
            </button></a>
    </div>
</header>






  <div className="mx-auto p-8 w-full max-w-screen-lg flex-1">

    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
  <div className="mb-6">
    <label htmlFor="topic" className="block mb-1 text-lg font-semibold text-black">Topic:</label>
    <input
      type="text"
      id="topic"
      name="topic"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      className="w-full p-2 border rounded mb-4 rounded-md border border-gray-200 bg-white text-sm shadow-lg font-satoshi font-medium focus:border-black focus:outline-none focus:ring-0"
      minLength="10"
      maxLength="200"
      placeholder='Where should I go on a summer vacation?'
    />
    <div className="flex flex-col md:flex-row md:justify-between mb-4">
      <div className="mb-4 md:mr-2 md:mb-0">
        <label htmlFor="optionA" className="block mb-1 text-lg font-semibold text-black">Option A:</label>
        <input
          type="text"
          id="optionA"
          name="optionA"
          value={optionA}
          placeholder='Barcelona'
          onChange={(e) => setOptionA(e.target.value)}
          className="w-full p-2 border rounded rounded-md border border-gray-200 bg-white text-sm shadow-lg font-satoshi font-medium focus:border-black focus:outline-none focus:ring-0"
        />
      </div>
      <div className="mb-4 md:ml-2 md:mb-0">
        <label htmlFor="optionB" className="block mb-1 text-lg font-semibold text-black">Option B:</label>
        <input
          type="text"
          id="optionB"
          name="optionB"
          value={optionB}
          placeholder='Monaco'
          onChange={(e) => setOptionB(e.target.value)}
          className="w-full p-2 border rounded rounded-md border border-gray-200 bg-white text-sm shadow-lg font-satoshi font-medium focus:border-black focus:outline-none focus:ring-0"
        />
      </div>
    </div>
    <div className="flex justify-center">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 text-white font-semibold py-2 px-3 rounded hover:bg-emerald-400 transition duration-200"
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </div>
  </div>
</form>


{formError && <p className="text-red-500 text-center">{formError}</p>}
    
    
    
<div className="flex flex-col items-center justify-center">
  {loading && 
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="spinner mb-4"></div>
      <p className="text-black text-center text-2xl">Just a moment...</p>
      <p className="text-sm text-black mt-2 text-center">
        The data is generated by the GPT API and may be inaccurate or outdated. Please provide a clear topic and two options to get the best results.
      </p>
    </div>
  }

<div className="md:grid md:grid-cols-1 lg:grid-cols-2 gap-4 px-4 py-6">
    {showResults && !loading && apiResponse.isParsedSuccessfully && Object.entries(apiResponse.options).map(([option, { pros, cons }], index) => (
      <div key={option} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-gray-200 transform hover:scale-105 transition-transform duration-200 ease-in-out mb-4">
        <h3 className='text-center text-3xl text-black font-bold mb-6'>{option}</h3>
        <h4 className='text-emerald-500 font-extrabold text-2xl mb-2'>Pros:</h4>
        <div className="bg-emerald-100 p-2 rounded-md mb-4 shadow-sm">
          <ul className='list-disc list-inside'>
          {pros && Array.isArray(pros) && pros.map((pro, i) => <li key={i} className='text-black font-semibold mb-2 leading-relaxed'>{pro}</li>)}
          </ul>
        </div>
        <h4 className='text-rose-500 text-2xl font-extrabold mb-2'>Cons:</h4>
        <div className="bg-rose-100 p-2 rounded-md shadow-sm">
          <ul className='list-disc list-inside'>
          {cons && Array.isArray(cons) && cons.map((con, i) => <li key={i} className='text-black font-semibold mb-2 leading-relaxed'>{con}</li>)}
          </ul>
        </div>
      </div>
    ))}
  </div>

  {showResults && !loading && !apiResponse.isParsedSuccessfully &&
    <div className="bg-white text-black rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-gray-200 transform hover:scale-105 transition-transform duration-200 ease-in-out my-4">
      <h3 className='text-center text-3xl text-black font-bold mb-6'>Answer</h3>
      <p className='text-center text-lg font-semibold'>{apiResponse.originalResponse}</p>
    </div>
}
</div>


<div className="flex flex-col items-center justify-center">
  {bestOption &&
    <div className="bg-white text-black rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-gray-200 transform hover:scale-105 transition-transform duration-200 ease-in-out my-4">
      <h2 className="text-center text-3xl text-black font-bold mb-6">Decision:</h2>
      <p className="text-center text-lg font-semibold">{bestOption}</p>
    </div>
  }
</div>


</div>


<Footer />


</>

);
}

