import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Payment() {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const paymentAmount = '$49.99';

  return (
    <>
      <Head>
        <title>Make Payment | Daddy Chips</title>
        <meta name="description" content="Complete your payment with Daddy Chips" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-700 mb-4">
              Complete Your <span className="text-amber-500">Payment</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scan the QR code below to complete your payment securely. Your transaction will be processed instantly.
            </p>
          </div>

          {/* Payment Content */}
          {paymentCompleted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Thank you for your payment of {paymentAmount}. Your transaction has been completed.</p>
              <button
                onClick={() => setPaymentCompleted(false)}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Make Another Payment
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto"
            >
              <div className="space-y-6">
                {/* Payment Amount */}
                {/* <div className="text-center">
                  <p className="text-sm text-gray-500">Amount to pay</p>
                  <h2 className="text-3xl font-bold text-amber-600">{paymentAmount}</h2>
                </div> */}

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
                    <Image
                      src="/images/QrCode.jpg"
                      alt="Payment QR Code"
                      width={200}
                      height={200}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                  <p className="text-sm text-gray-500">Scan this QR code with your payment app</p>
                </div>

                {/* Payment Instructions */}
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-700 mb-2">Payment Instructions</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                    <li>Open your mobile banking/payment app</li>
                    <li>Select 'Scan QR Code' option</li>
                    <li>Point your camera at the QR code above</li>
                    <li>Confirm the payment amount</li>
                    <li>Complete the transaction</li>
                  </ol>
                </div>

                {/* Submit Button */}
                {/* <div className="pt-2">
                  <button
                    onClick={() => setPaymentCompleted(true)}
                    className="w-full flex justify-center items-center px-6 py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
                  >
                    I've Completed the Payment
                  </button>
                </div> */}

                {/* Alternative Payment Methods */}
                {/* <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Having trouble with QR code?</p>
                  <button className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-1">
                    Use alternative payment methods
                  </button>
                </div> */}
              </div>
            </motion.div>
          )}

          {/* Payment Security Info */}
          {/* <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Secure Payment</h3>
                <p className="text-gray-600">
                  Your payment is processed through our secure payment gateway. We don't store your banking details.
                  All transactions are encrypted for your protection.
                </p>
              </div>
            </div>
          </motion.div> */}
        </motion.div>
      </div>
    </>
  );
}