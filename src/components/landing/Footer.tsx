
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/b040bcf1-975f-4316-8744-a19b2453d26e.png" 
              alt="STCKR Logo" 
              className="h-8"
            />
            <span className="text-gray-400 text-sm">© 2025 Stckr. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-8">
            <a 
              href="/privacy-policy" 
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Privacy Policy
            </a>
            <a 
              href="mailto:support@stckr.io" 
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
