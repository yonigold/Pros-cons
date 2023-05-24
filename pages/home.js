import {useState} from 'react';
import Head from 'next/head';
import Modal from '../components/Modal';
import { addToWaitlist } from '@/firebase/waitlist';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  function parseResponse(response) {
    const lines = response.split('\n');
    let currentOption = null;
    let currentSection = null;
    const options = {};
    let bestOption = "";
  
    for (const line of lines) {
      if (line.startsWith('Pros:')) {
        currentSection = 'pros';
        continue;
      } else if (line.startsWith('Cons:')) {
        currentSection = 'cons';
        continue;
      } else if (line.endsWith(':')) {
        currentOption = line.slice(0, -1).trim();
        options[currentOption] = { pros: [], cons: [] };
        continue;
      } else if (line.startsWith('The best option is: ')) {
        bestOption = line.slice('The best option is: '.length).trim();
        continue;
      }
      
      
  
      if (currentOption !== null && currentSection !== null) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('1.') || trimmedLine.startsWith('2.') || trimmedLine.startsWith('3.')) {
          options[currentOption][currentSection].push(trimmedLine.slice(2).trim());
        }
      }
    }
  
    if (Object.keys(options).length !== 2 || !options[Object.keys(options)[0]].pros.length || !options[Object.keys(options)[0]].cons.length || !options[Object.keys(options)[1]].pros.length || !options[Object.keys(options)[1]].cons.length) {
      throw new Error('Invalid response format');
    }
    
    return { options, bestOption };
  }
  
  
  
  
  

  const handleSubmit =  async (event) => {
    event.preventDefault();

    if (!question.trim() || !optionA.trim() || !optionB.trim()) {
      setFormError('Please fill all the fields');
      return;
    } else {
      setFormError('');
    }


    setLoading(true); 
    setBestOption(null);            
    try {
      const result = await axios.post('/api/openai', { question, optionA, optionB });
      const parsedData = parseResponse(result.data.response);
  
      setApiResponse(parsedData.options);
      setBestOption(parsedData.bestOption);
      console.log(parsedData.options);
      console.log(parsedData.bestOption);

      } catch (error) {
        console.log('Invalid response format', error);
        if (error.response) {
          setFormError(`An error occurred: ${error.response.data.error}`);
        }  else if (error.request) {
          if (error.code === 'ECONNABORTED') {
            setFormError('The request took too long - please try again later.');
          } else {
          setFormError('No response was received from the server.');
          }
        } else {
          setFormError(`An error occurred: ${error.message}`);
        }
      } finally {
        setLoading(false);
        setShowResults(true);
        
      }
    }

    const handleWaitlistSubmit = async (event) => {
      event.preventDefault();
      const email = event.target.email.value;
      if (!email.trim()) {
        setFormError('Please enter your email');
        return;
      } else {
        setFormError('');
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
        setFormError('An error occurred. Please try again later.');
      }
    }





  
  
  return (
    <>
    <Head>
      <title>Pros 'n Cons</title>
      <meta name="description" content="Have a hard time making decisions? Let AI help you! Simply enter your question and options below and we will do the rest." />
      <meta name='keywords' content='pros and cons, pros n cons, pros and cons generator, pros and cons maker, AI, Decision making, decision maker, decision maker AI, OpenAI, GPT' />
      <meta property="og:title" content="Pros 'n Cons" />
      <meta property="og:description" content="Have a hard time making decisions? Let AI help you! Simply enter your question and options below and we will do the rest." />
      <meta property="og:type" content="website" />
      </Head>
    <div className="flex justify-center min-h-screen flex-col"><button 
  className="px-4 py-2 bg-indigo-900 text-white rounded" 
  onClick={() => setModalOpen(true)}
>
  Join Waitlist
</button>

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
      className="p-2 border rounded w-full md:w-2/3 mx-auto mb-2"
    />
    <button type="submit" className="w-full md:w-2/3 mx-auto bg-indigo-900 text-white font-semibold py-2 px-3 rounded hover:bg-blue-600 transition duration-200">
      Join Waitlist
    </button>
    {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
  </form>
  ) : (
    <p className="text-green-500 text-sm mt-2 text-center">Thank you for joining our waitlist!</p>
  )}
</div>
  </Modal>

  <div className="mx-auto p-8 w-full max-w-screen-lg">
  
  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-center title">Pros <span className='text-indigo-900'>'n</span> Cons</h1>

    <h2 className="text-1xl font-semibold text-center text-white mb-8">
      Have a hard time making decisions? Let AI help you! Simply enter your question and options below and we will do the rest.
    </h2>

    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
  <div className="mb-6">
    <label htmlFor="topic" className="block mb-1 text-lg font-semibold text-white">Topic:</label>
    <input
      type="text"
      id="topic"
      name="topic"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      className="w-full p-2 border rounded mb-4"
    />
    <div className="flex flex-col md:flex-row md:justify-between mb-4">
      <div className="mb-4 md:mr-2 md:mb-0">
        <label htmlFor="optionA" className="block mb-1 text-lg font-semibold text-white">Option A:</label>
        <input
          type="text"
          id="optionA"
          name="optionA"
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4 md:ml-2 md:mb-0">
        <label htmlFor="optionB" className="block mb-1 text-lg font-semibold text-white">Option B:</label>
        <input
          type="text"
          id="optionB"
          name="optionB"
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
    <div className="flex justify-center">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-900 text-white font-semibold py-2 px-3 rounded hover:bg-blue-600 transition duration-200"
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </div>
  </div>
</form>


{formError && <p className="text-red-500 text-center">{formError}</p>}
    
    
    
    {loading && 
  <div className="flex flex-col items-center justify-center mt-12">
    <div className="spinner mb-4"></div>
    <p className="text-white text-center text-2xl">Just a moment...</p>
    <p className="text-sm text-white mt-2 text-center">
      The data is generated by the GPT API and may be inaccurate or outdated. Please provide a clear topic and two options to get the best results.
    </p>
  </div>
}

    <div className="md:grid md:grid-cols-2 gap-4">
  {showResults && !loading && Object.entries(apiResponse).map(([option, { pros, cons }], index) => (
    <div key={option} className="bg-gray-200 rounded-lg p-6 shadow-md hover:shadow-2xl transition-shadow duration-300 ease-in-out border-2 m-2 transform hover:scale-105 transition-transform duration-200 ease-in-out mb-4">
      <h3 className='text-center text-3xl text-black font-bold mb-6'>{option}</h3>
      <h4 className='text-indigo-900 font-extrabold text-2xl mb-2'>Pros:</h4>
      <div className="bg-green-100 p-2 rounded-md mb-4 shadow-sm">
        <ul className='list-disc list-inside'>
          {pros.map((pro, i) => <li key={i} className='text-black font-semibold mb-2 leading-relaxed'>{pro}</li>)}
        </ul>
      </div>
      <h4 className='text-indigo-900 text-2xl font-extrabold mb-2'>Cons:</h4>
      <div className="bg-red-100 p-2 rounded-md shadow-sm">
        <ul className='list-disc list-inside'>
          {cons.map((con, i) => <li key={i} className='text-black font-semibold mb-2 leading-relaxed'>{con}</li>)}
        </ul>
      </div>
    </div>
  ))}
</div>
{bestOption &&
  <div className="bg-gray-200 text-black rounded-lg p-6 shadow-md hover:shadow-2xl transition-shadow duration-300 ease-in-out border-2 m-2 transform hover:scale-105 transition-transform duration-200 ease-in-out my-4">
    <h2 className="text-center text-3xl font-bold mb-6">The Best Option is:</h2>
    <p className="text-center text-1xl font-semibold">{bestOption}</p>
  </div>
}

 </div>

 
<footer className="mt-auto py-4 text-center bg-indigo-900 text-white w-full">
    <p className="mb-2">
      Created by Yonatan Goldshtein. Powered by <a href="https://openai.com/" className="underline hover:text-indigo-300">OpenAI</a>.
    </p>
    <div className="flex justify-center">
      <a href="#" className="mx-2 hover:text-indigo-300">
        <i className="fab fa-twitter"></i>
      </a>
      <a href="#" className="mx-2 hover:text-indigo-300">
        <i className="fab fa-linkedin-in"></i>
      </a>
      <a href="#" className="mx-2 hover:text-indigo-300">
        <i className="fab fa-github"></i>
      </a>
    </div>
  </footer>
</div>
</>


  
  
);
}




// Pizza:

// Pros:
// 1. Versatile toppings: Pizza can be customized with a variety of toppings, making it a great option for picky eaters or those with dietary restrictions.
// 2. Easy to share: Pizza is often served in large sizes, making it a great option for sharing with friends or family.
// 3. Quick and convenient: Pizza can be ordered for delivery or picked up from a nearby restaurant, making it a quick and easy dinner option.

// Cons:
// 1. High in calories: Pizza can be high in calories, especially if it is loaded with cheese and meat toppings.
// 2. Can be expensive: Ordering pizza from a restaurant or getting it delivered can be expensive, especially if you add on extra toppings.
// 3. Not very filling: Pizza may not be very filling for some people, especially if they are used to eating larger portions.

// Hamburger:

// Pros:
// 1. Filling: Hamburgers are often made with meat and bread, making them a filling dinner option.
// 2. Affordable: Hamburgers can be made at home for a fraction of the cost of ordering pizza from a restaurant.
// 3. Easy to customize: Like pizza, hamburgers can be customized with a variety of toppings to suit your taste preferences.

// Cons:
// 1. Limited toppings: While hamburgers can be customized, they are often limited to traditional toppings like lettuce, tomato, and cheese.
// 2. Messy to eat: Hamburgers can be messy to eat, especially if they are loaded with toppings.
// 3. Not as convenient: Making hamburgers at home can take longer than ordering pizza or picking it up from a restaurant.