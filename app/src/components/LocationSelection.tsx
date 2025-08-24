import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Building, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LocationSelectionProps {
  onComplete: (district: string, college: string) => void;
  onBack: () => void;
  selectedLanguage: string;
}

const LocationSelection: React.FC<LocationSelectionProps> = ({ onComplete, onBack, selectedLanguage }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [availableColleges, setAvailableColleges] = useState<string[]>([]);

  const transition = {
    type: 'tween' as const,
    ease: 'easeInOut',
    duration: 1.2
  };

  const translations = {
    en: {
      title: 'Select Your Location',
      subtitle: 'Choose your district and college to get personalized content',
      state: 'State',
      district: 'District',
      college: 'College',
      stateNote: 'Currently available only in Maharashtra',
      selectDistrict: 'Select your district',
      selectCollege: 'Select your college',
      firstSelectDistrict: 'First select a district',
      yourSelection: 'Your Selection:',
      continue: 'Continue'
    },
    mr: {
      title: 'तुमचे स्थान निवडा',
      subtitle: 'वैयक्तिकृत सामग्री मिळविण्यासाठी तुमचा जिल्हा आणि कॉलेज निवडा',
      state: 'राज्य',
      district: 'जिल्हा',
      college: 'कॉलेज',
      stateNote: 'सध्या फक्त महाराष्ट्रात उपलब्ध',
      selectDistrict: 'तुमचा जिल्हा निवडा',
      selectCollege: 'तुमचे कॉलेज निवडा',
      firstSelectDistrict: 'प्रथम जिल्हा निवडा',
      yourSelection: 'तुमची निवड:',
      continue: 'पुढे'
    },
    hi: {
      title: 'अपना स्थान चुनें',
      subtitle: 'व्यक्तिगत सामग्री प्राप्त करने के लिए अपना जिला और कॉलेज चुनें',
      state: 'राज्य',
      district: 'जिला',
      college: 'कॉलेज',
      stateNote: 'वर्तमान में केवल महाराष्ट्र में उपलब्ध',
      selectDistrict: 'अपना जिला चुनें',
      selectCollege: 'अपना कॉलेज चुनें',
      firstSelectDistrict: 'पहले जिला चुनें',
      yourSelection: 'आपका चयन:',
      continue: 'जारी रखें'
    }
  };

  // Maharashtra districts
  const districts = [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Aurangabad', 'Solapur', 'Amravati', 'Nashik',
    'Kolhapur', 'Sangli', 'Akola', 'Jalgaon', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur',
    'Yavatmal', 'Nanded', 'Satara', 'Beed', 'Osmanabad', 'Buldhana', 'Parbhani', 'Washim',
    'Jalna', 'Hingoli', 'Wardha', 'Nandurbar', 'Gondia', 'Gadchiroli', 'Bhandara', 'Raigad',
    'Ratnagiri', 'Sindhudurg'
  ];

  // Comprehensive colleges data for all Maharashtra districts
  const collegesData: Record<string, string[]> = {
    'Mumbai': [
      'St. Xavier\'s College', 'Jai Hind College', 'K.C. College', 'Mithibai College', 
      'H.R. College of Commerce and Economics', 'Wilson College', 'Sophia College for Women',
      'Ramnarain Ruia Autonomous College', 'Sydenham College', 'Elphinstone College',
      'St. Andrew\'s College', 'Kishinchand Chellaram College', 'Bhavan\'s College',
      'R.A. Podar College of Commerce and Economics', 'Smt. M.M.K. College of Commerce and Economics',
      'Lala Lajpat Rai College', 'Smt. Chandibai Himathmal Mansukhani College', 'Khalsa College',
      'Government Law College', 'Anjuman-I-Islam Kalsekar Technical Campus'
    ],
    'Pune': [
      'Fergusson College', 'S.P. College', 'Modern College of Arts Science and Commerce',
      'Garware College of Commerce', 'Brihan Maharashtra College of Commerce', 'Nowrosjee Wadia College',
      'Abasaheb Garware College', 'St. Mira\'s College for Girls', 'Symbiosis College of Arts and Commerce',
      'D.G. Ruparel College', 'Gokhale Institute of Politics and Economics', 'Pune University',
      'MIT Arts Commerce and Science College', 'Fergusson College', 'S.B. College',
      'Wadia College', 'Maharaja Sayajirao University', 'Tilak Maharashtra Vidyapeeth',
      'Savitribai Phule Pune University', 'Deccan College Post-Graduate and Research Institute'
    ],
    'Nagpur': [
      'Hislop College', 'Morris College', 'Dharampeth Science College', 'Jagadambha Mahavidyalaya',
      'St. Francis De Sales College', 'Rashtrasant Tukadoji Maharaj Nagpur University',
      'Government Medical College', 'Nagpur University', 'Kamla Nehru Mahavidyalaya',
      'G.S. College of Commerce', 'Shri Shivaji Arts Commerce and Science College',
      'S.K. Porwal College', 'J.M. Patel College', 'Taywade College',
      'Institute of Science', 'R.S.M. College', 'Mahila Mahavidyalaya',
      'Government Polytechnic', 'Suresh Gyan Vihar University', 'Lokmat College'
    ],
    'Thane': [
      'Thane Municipal Corporation Dr. Siddharth College', 'S.I.E.S. College of Arts Science and Commerce',
      'Birla College of Arts Science and Commerce', 'V.P.M.\'s R.Z. Shah College',
      'K.V. Pendharkar College of Arts Science and Commerce', 'Smt. P.N. Doshi Women\'s College',
      'Sheth N.K.T.T. College of Commerce', 'Sir J.J. College of Arts', 
      'Ramniranjan Jhunjhunwala College', 'Karmaveer Bhaurao Patil College',
      'M.L. Dahanukar College of Commerce', 'J.S.M. College', 'C.K.T. College',
      'Viva College', 'Saraswati College', 'R.K. Talreja College',
      'Kelkar College', 'New Hind College', 'Patkar-Varde College', 'Vartak College'
    ],
    'Aurangabad': [
      'Deogiri College', 'Milliya Arts Science and Management Science College', 'Maulana Azad College',
      'Dr. Babasaheb Ambedkar Marathwada University', 'Government College of Arts and Science',
      'Vivekanand Arts Sardar Dalipsingh Commerce and Science College', 'N.E.S. Science College',
      'Yogeshwari Mahavidyalaya', 'Shri Chhatrapati Shivaji College', 'New Arts Commerce and Science College',
      'Shri Guru Gobind Singhji College', 'Mahatma Gandhi Mission College', 'Shri Saibaba College',
      'Arts Commerce and Science College', 'Mahatma Phule Arts and Science College',
      'Sant Gadge Baba College', 'Shri Dnyaneshwar College', 'Government Medical College'
    ],
    'Solapur': [
      'D.B.F. Dayanand College of Arts and Science', 'S.P. Mandali Ramnarain Ruia College',
      'Punyashlok Ahilyadevi Holkar Solapur University', 'Sangameshwar College',
      'Shri Chatrapati Shivaji College', 'A.S.C. College', 'Karmaveer Hire Arts and Commerce College',
      'Shardabai Pawar Mahila Mahavidyalaya', 'Government College of Arts and Science',
      'Shri Sant Gajanan Maharaj College', 'Walchand College of Arts and Science',
      'Hutatma Rajguru Mahavidyalaya', 'Sangola College', 'Pandharpur College',
      'Tuljapur College', 'Akkalkot College', 'Mangalwedha College'
    ],
    'Amravati': [
      'Government Vidarbha Institute of Science and Humanities', 'Shri Shivaji Arts Commerce and Science College',
      'Sant Gadge Baba Amravati University', 'P.R. Pote Patil College of Engineering and Management',
      'Prof. Ram Meghe College of Engineering and Management', 'Sipna College of Engineering and Technology',
      'Shri Sant Gajanan Maharaj College of Engineering', 'Government College of Engineering',
      'Amravati University', 'Arts Commerce and Science College', 'Vidya Bharati Mahavidyalaya',
      'Shri Shivaji College', 'Government Medical College', 'New Arts Commerce and Science College'
    ],
    'Nashik': [
      'Arts Commerce and Science College', 'H.P.T. Arts and R.Y.K. Science College',
      'K.T.H.M. College', 'S.S.V.P.S. College', 'L.V.H. Arts Science and Commerce College',
      'Gokhale Education Society\'s College', 'S.M. Dnyandeo Mohekar College',
      'Arts Science and Commerce College Surgana', 'Shri Swami Vivekanand College',
      'Matoshri College of Arts and Science', 'Dr. A.P.J. Abdul Kalam College',
      'Shri Datta Meghe College', 'Pravara Rural College', 'MVP Samaj College',
      'Shri Muktanand College', 'Shri L.G. Patil College', 'Bhonsla College'
    ],
    'Kolhapur': [
      'Rajaram College', 'Shivaji University', 'The New College', 'Yashwantrao Chavan College',
      'Vivekanand College', 'Chh. Shahu College', 'Dattajirao Kadam Arts Science and Commerce College',
      'Smt. Kasturbai Walchand College', 'Sadguru Gadge Maharaj College', 'Bharati Vidyapeeth College',
      'Shahaji Chhatrapati College', 'Shri Vijaysinha Yadav Arts and Science College',
      'Kanyashree Shikshan Sanstha College', 'Radhabai Kale Mahila Mahavidyalaya',
      'Tatyasaheb Kore College', 'Willingdon College', 'D.K.T.E. Society College',
      'Shri Datta Arts and Commerce College'
    ],
    'Sangli': [
      'Willingdon College', 'Chintaman Rao College', 'Bharatesh College',
      'Kisan Arts Commerce and Science College', 'Shri Vijay Rural College',
      'Appasaheb Birnale College', 'Shri Swami Vivekanand Arts and Commerce College',
      'Walchand College of Arts and Science', 'Shri Chhatrapati Shivaji College',
      'Adarsh Shikshan Prasarak Mandal College', 'Yashavantrao Chavan Arts Science College',
      'Vishwasrao Naik Arts Commerce and Baba Naik Science College', 'Someshwar College'
    ],
    'Akola': [
      'Akola College', 'Shri Shivaji Arts Commerce and Science College',
      'Mahatma Fule Arts Commerce and Sitaramji Chaudhari Science College', 'Gramin Mahavidyalaya',
      'Sant Gadge Baba College', 'Shri Sant Gajanan Maharaj College',
      'R.A. Arts and S.M.B. Commerce College', 'New Arts Commerce and Science College',
      'Shri Chhatrapati Shahu College', 'Government Vidarbha Institute of Science and Humanities'
    ],
    'Jalgaon': [
      'K.C.E. Society\'s College of Engineering and Information Technology', 'R.C. Patel Arts Commerce and Science College',
      'Smt. G.G. Khadse College', 'Z.B. Patil College', 'H.J. Thim College of Engineering and Technology',
      'Jalgaon Education Society\'s College', 'Arts Science and Commerce College',
      'Government College of Engineering', 'Shri H.V.P.M. College', 'L.V.H. College',
      'New Arts Commerce and Science College', 'Government Polytechnic', 'Bharati Vidyapeeth College'
    ],
    'Latur': [
      'Swami Ramanand Teerth Marathwada University', 'Shri Chhatrapati Shivaji College',
      'Arts Science and Commerce College', 'Government College of Engineering',
      'ACS College', 'BVDU College', 'Shivaji College', 'Government Medical College',
      'Arts Commerce and Science College', 'Dnyanopasak College', 'Latur Education Society College',
      'Government Polytechnic', 'New Arts Commerce and Science College'
    ],
    'Dhule': [
      'Z.B. Patil College', 'S.S.V.P.S. College of Engineering', 'L.V.H. Arts Science and Commerce College',
      'Government College of Engineering', 'Arts Science and Commerce College',
      'Shri J.J.T. University', 'Government Medical College', 'New College',
      'Dr. Babasaheb Ambedkar College', 'Government Polytechnic', 'Municipal College'
    ],
    'Ahmednagar': [
      'Ahmednagar College', 'Tuljaram Chaturchand College', 'New Arts Commerce and Science College',
      'Government College of Engineering', 'Shri Chhatrapati Shivaji College',
      'K.K. Wagh Institute of Engineering Education and Research', 'Government Medical College',
      'Arts Science and Commerce College', 'Government Polytechnic', 'COEP Technological University'
    ],
    'Chandrapur': [
      'Gondwana University', 'Government College of Engineering', 'Priyadarshini College of Engineering',
      'J.M. Patel College', 'Arts Science and Commerce College', 'Government Medical College',
      'Shri Shivaji College', 'New College', 'Government Polytechnic', 'Municipal College'
    ],
    'Yavatmal': [
      'Shri Shivaji Arts Commerce and Science College', 'Government College of Engineering',
      'Sant Gadge Baba Amravati University', 'Arts Science and Commerce College',
      'Government Medical College', 'New College', 'Shri Chhatrapati Shivaji College',
      'Government Polytechnic', 'Municipal College'
    ],
    'Nanded': [
      'Swami Ramanand Teerth Marathwada University', 'Government College of Engineering',
      'Shri Guru Gobind Singhji Institute of Engineering and Technology', 'Arts Science and Commerce College',
      'Government Medical College', 'Shri Chhatrapati Shivaji College', 'New College',
      'Government Polytechnic', 'Municipal College'
    ],
    'Satara': [
      'Yashwantrao Chavan College of Engineering', 'Karmaveer Bhaurao Patil College',
      'D.Y. Patil College of Engineering', 'Arts Science and Commerce College',
      'Government College', 'Shivaji University', 'New College',
      'Government Medical College', 'Government Polytechnic'
    ],
    'Beed': [
      'Dr. Babasaheb Ambedkar Marathwada University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Chhatrapati Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic',
      'Municipal College'
    ],
    'Osmanabad': [
      'Swami Ramanand Teerth Marathwada University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Chhatrapati Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Buldhana': [
      'Sant Gadge Baba Amravati University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Parbhani': [
      'Swami Ramanand Teerth Marathwada University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Chhatrapati Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Washim': [
      'Sant Gadge Baba Amravati University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Jalna': [
      'Dr. Babasaheb Ambedkar Marathwada University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Chhatrapati Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Hingoli': [
      'Swami Ramanand Teerth Marathwada University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Chhatrapati Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Wardha': [
      'Rashtrasant Tukadoji Maharaj Nagpur University', 'Government College of Engineering',
      'Mahatma Gandhi Institute of Medical Sciences', 'Arts Science and Commerce College',
      'Shri Shivaji College', 'Government Medical College', 'New College',
      'Government Polytechnic'
    ],
    'Nandurbar': [
      'North Maharashtra University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Chhatrapati Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic',
      'Tribal Development College'
    ],
    'Gondia': [
      'Rashtrasant Tukadoji Maharaj Nagpur University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Gadchiroli': [
      'Rashtrasant Tukadoji Maharaj Nagpur University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Bhandara': [
      'Rashtrasant Tukadoji Maharaj Nagpur University', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Shri Shivaji College',
      'Government Medical College', 'New College', 'Government Polytechnic'
    ],
    'Raigad': [
      'University of Mumbai', 'Government College of Engineering',
      'Arts Science and Commerce College', 'Pillai College of Engineering',
      'Fr. C. Rodrigues Institute of Technology', 'Government Medical College',
      'New College', 'Government Polytechnic'
    ],
    'Ratnagiri': [
      'University of Mumbai', 'Finolex Academy of Management and Technology',
      'Arts Science and Commerce College', 'Government College of Engineering',
      'Government Medical College', 'New College', 'Government Polytechnic',
      'Coastal Engineering College'
    ],
    'Sindhudurg': [
      'University of Mumbai', 'Arts Science and Commerce College',
      'Government College of Engineering', 'Government Medical College',
      'New College', 'Government Polytechnic', 'Coastal Studies College',
      'Marine Engineering Institute'
    ]
  };

  const currentTranslation = translations[selectedLanguage as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (selectedDistrict) {
      setAvailableColleges(collegesData[selectedDistrict] || [
        'Government College', 'Arts and Science College', 'Commerce College',
        'District College', 'Municipal College', 'Autonomous College'
      ]);
      setSelectedCollege('');
    }
  }, [selectedDistrict]);

  const handleNext = () => {
    console.log('LocationSelection - handleNext called', { selectedDistrict, selectedCollege });
    if (selectedDistrict && selectedCollege) {
      console.log('LocationSelection - calling onComplete');
      onComplete(selectedDistrict, selectedCollege);
    } else {
      console.log('LocationSelection - missing district or college');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-6">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {currentTranslation.title}
          </h1>
          <p className="text-base text-gray-600 px-2">
            {currentTranslation.subtitle}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 mb-6"
        >
          {/* State Selection (Locked) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {currentTranslation.state}
            </label>
            <div className="relative">
              <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 flex items-center justify-between">
                <span>Maharashtra</span>
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentTranslation.stateNote}</p>
          </div>

          {/* District Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {currentTranslation.district}
            </label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-full p-4 border border-gray-300 rounded-xl">
                <SelectValue placeholder={currentTranslation.selectDistrict} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* College Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {currentTranslation.college}
            </label>
            <Select 
              value={selectedCollege} 
              onValueChange={setSelectedCollege}
              disabled={!selectedDistrict}
            >
              <SelectTrigger className={`w-full p-4 border border-gray-300 rounded-xl ${
                !selectedDistrict ? 'bg-gray-100 text-gray-400' : ''
              }`}>
                <SelectValue placeholder={
                  selectedDistrict ? currentTranslation.selectCollege : currentTranslation.firstSelectDistrict
                } />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableColleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{college}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Selection Summary */}
        {(selectedDistrict || selectedCollege) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">{currentTranslation.yourSelection}</h3>
            <div className="space-y-1 text-xs text-blue-800">
              <p><span className="font-medium">{currentTranslation.state}:</span> Maharashtra</p>
              {selectedDistrict && (
                <p><span className="font-medium">{currentTranslation.district}:</span> {selectedDistrict}</p>
              )}
              {selectedCollege && (
                <p><span className="font-medium">{currentTranslation.college}:</span> {selectedCollege}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex space-x-4"
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-4 rounded-2xl border-gray-300 bg-white hover:bg-gray-50"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedDistrict || !selectedCollege}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 ${
              selectedDistrict && selectedCollege
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Done</span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex justify-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default LocationSelection;