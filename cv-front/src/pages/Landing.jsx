import { useClerk, useUser } from "@clerk/clerk-react";
import { features, positions, steps } from "../assets/data";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import PositionsSection from "../components/landing/PositionsSection";
import StepsSection from "../components/landing/StepsSection";

import CTASection from "../components/landing/CTASection";
import FooterSection from "../components/landing/FooterSection";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Landing = () => {
    const { openSignIn, openSignUp } = useClerk();
    const { isSignedIn } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSignedIn) {
            navigate('/dashboard');
        }
    }, [isSignedIn, navigate]);
    
    return (
        <div className="Landing-page bg-linear-to-b from-gray-50 to-gray-100 font-sans text-gray-800 overflow-hidden">
            {/* Hero section */}
            <HeroSection openSignIn={openSignIn} openSignUp={openSignUp} />
            
            {/* Features section */}
            <FeaturesSection features={features} />
            
            {/* Positions section */}
            <PositionsSection positions={positions} />
            
            {/* Steps section */}
            <StepsSection steps={steps} />
            
            {/* CTA section */}
            <CTASection openSignUp={openSignUp} />
            
            {/* Footer section */}
            <FooterSection />
        </div>
    );
};

export default Landing;