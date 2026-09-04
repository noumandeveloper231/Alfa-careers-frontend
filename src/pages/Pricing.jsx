import { useState } from 'react'
import Navbar from '../components/Navbar'
import { ChevronDown } from 'lucide-react'
import PricingComponent from '../components/PricingComponent';

const Pricing = () => {

    const [openIndex, setOpenIndex] = useState(null);


    const faqs = [
        {
            q: "Can I edit my job listing after it's posted?",
            a: "Yes. You can edit title, description, location, and compensation from your dashboard. Changes publish instantly and candidates see the updated post right away.",
        },
        {
            q: "Are there any additional fees attached to my job post?",
            a: "No hidden fees. You pay only the plan price shown. Taxes may apply depending on your billing region.",
        },
        {
            q: "How do refunds work?",
            a: "Annual plans are eligible for prorated refunds within 7 days of purchase. Posted jobs are non-refundable once applications have been received.",
        },
        {
            q: "How do I get started hiring on Alfa Careers?",
            a: "Create a employee account, choose a plan, and publish your first job. Guided steps and prompts help you complete the listing in minutes.",
        },
        {
            q: "How do I get access to my team's company profile?",
            a: "Invite teammates from the dashboard and assign roles. Admins control access, and domain verification links your company profile automatically.",
        },
    ];

    return (
        <div>
            <Navbar />
            <div className='my-20 text-center px-3 lg:p-0 flex flex-col items-center gap-2'>
                <h4 className='text-3xl font-semibold text-black'>
                    Simple, transparent pricing
                </h4>
                <p className='mt-1text-gray-500'>
                    Our simple, per-job pricing scales with you.
                </p>
                <PricingComponent />

                <div className='mt-16 w-full max-w-3xl px-4'>
                    <p className='font-semibold text-black text-center'>FAQ'S</p>
                    <h2 className='text-2xl sm:text-3xl font-semibold text-center text-black mt-2'>
                        Any questions? We're here to help
                    </h2>

                    <div className='mt-8 space-y-6'>
                        {faqs.map((item, i) => {
                            const open = openIndex === i;
                            return (
                                <div key={i} className='rounded-3xl border border-gray-200 bg-white'>
                                    <button
                                        type='button'
                                        className='w-full flex items-center justify-between px-6 py-6'
                                        onClick={() => setOpenIndex(open ? null : i)}
                                    >
                                        <span className='text-black'>{item.q}</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-black transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
                                        />
                                    </button>
                                    <div className={`px-6 transition-all duration-300 overflow-hidden ${open ? 'max-h-40 opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}`}>
                                        <p className='text-gray-600'>{item.a}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className='mt-8 text-center'>
                        <p className='text-sm text-black'>Have a question not covered in the FAQ?</p>
                        <button className='mt-3 primary-btn'>Contact us</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing