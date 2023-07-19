'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [amount, setAmount] = useState('');
  const router = useRouter();

  function generateRandomString(length:number) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    const randomValues = new Uint32Array(length);
  
    window.crypto.getRandomValues(randomValues);
  
    for (let i = 0; i < length; i++) {
      const randomIndex = randomValues[i] % charset.length;
      randomString += charset.charAt(randomIndex);
    }
  
    return randomString;
  }

  async function checkOut() {  
    const data = {
      publicKey: process.env.NEXT_PUBLIC_SB_PUBLIC_KEY,
      amount:amount,
      currency: 'NGN',
      paymentReference: generateRandomString(10),
      country: 'NG',
      email: 'starboy1@gmail.com',
      callbackUrl: 'http://localhost:3000'
    }

    try {
      const paymentKey = await fetch('https://seerbitapi.com/api/v2/encrypt/keys', {
        method: 'POST',
        body: JSON.stringify({ key: `${process.env.NEXT_PUBLIC_SB_SECRET_KEY}.${process.env.NEXT_PUBLIC_SB_PUBLIC_KEY}` })
      })

      const keyRes = await paymentKey.json()
      const key = keyRes.data.EncryptedSecKey.encryptedKey;
      
      const payLink = await fetch('https://seerbitapi.com/api/v2/payments', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 0 }
      })
      const payRes = await payLink.json()

      payRes.data.payments.redirectLink ? router.push(payRes.data.payments.redirectLink) : alert('Try again later')
        
    } catch(error) {
      console.log(error)
    }
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md p-8 text-center bg-white shadow-sm rounded-lg">
        <h1 className="text-3xl text-gray-800 mb-4">Support Our Cause</h1>
        <p className="text-gray-600 text-lg mb-8">Your donation can make a difference.</p>
        <div className="bg-gray-200 rounded-lg p-4 shadow-md relative overflow-hidden">
          <div className="h-3 bg-gray-300 rounded-md mb-4 relative">
            <div className="h-full w-40 bg-blue-400 rounded-md"></div>
          </div>
          <div className="text-gray-700 text-base mb-6">
            <span className="font-semibold">N1200</span> raised of N5000
          </div>
          <div className="flex items-center justify-center">
            <label htmlFor="donation-amount" className="text-gray-600 text-lg">Enter amount:</label>
            <input 
              type="text" 
              name='value'
              id="donation-amount" 
              placeholder="Enter amount"
              value={amount} 
              className="w-20 p-2 text-gray-900 border border-gray-300 rounded-md mx-2"
              onChange={(e) => setAmount(e.target.value)} 
              />
            <button
              onClick={checkOut} 
              className="donate-btn bg-blue-500 text-white border-none py-2 px-4 rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-600"
            >
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
