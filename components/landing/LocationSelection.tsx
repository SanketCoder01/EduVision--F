import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ChevronDown, ArrowLeft, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationSelectionProps {
  onComplete: (district: string, college: string) => void;
  onBack: () => void;
  selectedLanguage: string;
}

const LocationSelection: React.FC<LocationSelectionProps> = ({ onComplete, onBack, selectedLanguage }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const translations = {
    en: {
      title: 'Select Your Location',
      subtitle: 'Choose your district and college in Maharashtra',
      state: 'Maharashtra, India',
      district: 'Select District',
      college: 'Select College',
      search: 'Search districts or colleges...',
      next: 'Continue',
      back: 'Back',
      changeDistrict: 'Change District',
      selectedDistrict: 'Selected District',
      collegesIn: 'Colleges in'
    },
    mr: {
      title: 'तुमचे स्थान निवडा',
      subtitle: 'महाराष्ट्रातील तुमचा जिल्हा आणि महाविद्यालय निवडा',
      state: 'महाराष्ट्र, भारत',
      district: 'जिल्हा निवडा',
      college: 'महाविद्यालय निवडा',
      search: 'जिल्हे किंवा महाविद्यालये शोधा...',
      next: 'पुढे',
      back: 'मागे',
      changeDistrict: 'जिल्हा बदला',
      selectedDistrict: 'निवडलेला जिल्हा',
      collegesIn: 'मधील महाविद्यालये'
    },
    hi: {
      title: 'अपना स्थान चुनें',
      subtitle: 'महाराष्ट्र में अपना जिला और कॉलेज चुनें',
      state: 'महाराष्ट्र, भारत',
      district: 'जिला चुनें',
      college: 'कॉलेज चुनें',
      search: 'जिले या कॉलेज खोजें...',
      next: 'आगे',
      back: 'वापस',
      changeDistrict: 'जिला बदलें',
      selectedDistrict: 'चुना गया जिला',
      collegesIn: 'में कॉलेज'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  const districts = [
    'Pune', 'Mumbai City', 'Mumbai Suburban', 'Nashik', 'Nagpur', 'Thane', 'Aurangabad',
    'Solapur', 'Ahmednagar', 'Kolhapur', 'Sangli', 'Satara', 'Raigad', 'Nanded',
    'Latur', 'Amravati', 'Akola', 'Osmanabad', 'Buldhana', 'Jalgaon', 'Chandrapur',
    'Yavatmal', 'Dhule', 'Nandurbar', 'Jalna', 'Parbhani', 'Beed', 'Hingoli',
    'Gondia', 'Gadchiroli', 'Sindhudurg', 'Ratnagiri', 'Wardha', 'Washim', 'Bhandara'
  ];

  const collegesByDistrict: { [key: string]: string[] } = {
    'Ahmednagar': [
      'Sanjivani College of Engineering, Kopargaon',
      'Sanjivani University , Kopargaon',
      
    ],
    'Pune': [
      'College of Engineering Pune (COEP)',
      'Pune Institute of Computer Technology (PICT)',
      'Maharashtra Institute of Technology (MIT)',
      'Symbiosis Institute of Technology',
      'Vishwakarma Institute of Technology (VIT)',
      'Bharati Vidyapeeth College of Engineering',
      'JSPM Narhe Technical Campus',
      'Zeal College of Engineering and Research'
    ],
    'Mumbai City': [
      'Indian Institute of Technology Bombay (IIT Bombay)',
      'Veermata Jijabai Technological Institute (VJTI)',
      'Dwarkadas J. Sanghvi College of Engineering',
      'K.J. Somaiya College of Engineering',
      'Thadomal Shahani Engineering College',
      'Sardar Patel Institute of Technology',
      'Atharva College of Engineering',
      'Vivekanand Education Society Institute of Technology',
      'Rizvi College of Engineering',
      'Mumbai University Institute of Chemical Technology'
    ],
    'Mumbai Suburban': [
      'Mukesh Patel School of Technology Management & Engineering',
      'Thakur College of Engineering and Technology',
      'Universal College of Engineering',
      'Bharatiya Vidya Bhavan Sardar Patel Institute of Technology',
      'Shree L.R. Tiwari College of Engineering',
      'Vidyalankar Institute of Technology',
      'Rajiv Gandhi Institute of Technology',
      'Fr. Conceicao Rodrigues College of Engineering',
      'Pillai College of Engineering',
      'Shah & Anchor Kutchhi Engineering College'
    ],
    'Nashik': [
      'K.K. Wagh Institute of Engineering Education & Research',
      'Sandip Institute of Technology & Research Centre',
      'MET Bhujbal Knowledge City',
      'Gokhale Education Society College of Engineering',
      'Pravara Rural Engineering College',
      'Smt. Kashibai Navale College of Engineering',
      'Jawaharlal Nehru Engineering College',
      'RMD Sinhgad School of Engineering',
      'Guru Gobind Singh College of Engineering & Research Centre',
      'Trinity College of Engineering and Research'
    ],
    'Nagpur': [
      'Visvesvaraya National Institute of Technology (VNIT)',
      'Yeshwantrao Chavan College of Engineering',
      'Shri Ramdeobaba College of Engineering and Management',
      'G.H. Raisoni College of Engineering',
      'Priyadarshini College of Engineering',
      'Laxminarayan Institute of Technology',
      'KDK College of Engineering',
      'Rajiv Gandhi College of Engineering & Research',
      'Datta Meghe College of Engineering',
      'Tulsiramji Gaikwad-Patil College of Engineering & Technology'
    ],
    'Thane': [
      'Thakur College of Engineering and Technology',
      'Vidyavardhini College of Engineering and Technology',
      'Saraswati College of Engineering',
      'Agnel Institute of Technology and Design',
      'Shree L.R. Tiwari College of Engineering',
      'Rajiv Gandhi Institute of Technology',
      'Universal College of Engineering',
      'Konkan Gyanpeeth Rahul Dharkar College of Engineering',
      'Bharat Education Society Engineering College',
      'Lokmanya Tilak College of Engineering'
    ],
    'Aurangabad': [
      'Government College of Engineering Aurangabad',
      'Marathwada Institute of Technology',
      'Deogiri Institute of Engineering & Management Studies',
      'Hi-Tech Institute of Technology',
      'MGM College of Engineering and Technology',
      'Jawaharlal Nehru Engineering College',
      'Aditya Engineering College',
      'SRES College of Engineering',
      'Shri Guru Gobind Singhji Institute of Engineering & Technology',
      'International Institute of Information Technology'
    ]
  };

  // Get all colleges for search
  const allColleges = Object.values(collegesByDistrict).flat();

  const filteredDistricts = districts.filter(district =>
    district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableColleges = selectedDistrict ? 
    (collegesByDistrict[selectedDistrict as keyof typeof collegesByDistrict] || []) : 
    [];

  const filteredColleges = selectedDistrict ? 
    availableColleges.filter(college =>
      college.toLowerCase().includes(searchTerm.toLowerCase())
    ) :
    allColleges.filter(college =>
      college.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Show top 10 results when no district selected

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-xs text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                <Lock className="w-3 h-3" />
                <p className="text-xs font-medium">{t.state}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="max-w-md mx-auto">
            {/* Selected District Display */}
            {selectedDistrict && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t.selectedDistrict}</p>
                      <p className="font-semibold text-gray-900">{selectedDistrict}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDistrict('');
                      setSelectedCollege('');
                      setSearchTerm('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t.changeDistrict}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mb-6"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-lg border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </motion.div>

            {/* District Selection */}
            {!selectedDistrict && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  {t.district}
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredDistricts.map((district, index) => (
                    <motion.button
                      key={district}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedDistrict(district);
                        setSearchTerm('');
                      }}
                      className="w-full p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <MapPin className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-blue-700">
                            {district}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 rotate-[-90deg] transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* College Selection */}
            {selectedDistrict && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  {t.collegesIn} {selectedDistrict}
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredColleges.map((college, index) => (
                    <motion.button
                      key={college}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.03 }}
                      onClick={() => {
                        setSelectedCollege(college);
                      }}
                      className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                        selectedCollege === college
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          selectedCollege === college
                            ? 'bg-blue-100'
                            : 'bg-gray-100 hover:bg-blue-100'
                        }`}>
                          <Building2 className={`w-4 h-4 ${
                            selectedCollege === college ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <span className={`font-medium text-sm leading-relaxed ${
                          selectedCollege === college ? 'text-blue-800' : 'text-gray-900'
                        }`}>
                          {college}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex space-x-4"
            >
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 h-12 rounded-lg border-gray-300 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>
              <Button
                onClick={() => onComplete(selectedDistrict, selectedCollege)}
                disabled={!selectedCollege}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Done
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelection;
