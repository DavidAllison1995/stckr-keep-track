
const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 py-8 px-4 border-t border-gray-100">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/b040bcf1-975f-4316-8744-a19b2453d26e.png" 
              alt="STCKR Logo" 
              className="h-6"
            />
            <span className="text-gray-500 text-sm">© 2025 Stckr. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a 
              href="/privacy-policy" 
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm"
            >
              Privacy Policy
            </a>
            <a 
              href="mailto:support@stckr.io" 
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm"
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
