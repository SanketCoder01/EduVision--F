"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Code,
  Play,
  Terminal,
  Download,
  Copy,
  RotateCcw,
  Maximize2,
  Settings,
  FileText,
  BookOpen,
  Layers,
  Grid,
  Save,
  ArrowLeft
} from "lucide-react"

interface CodeTemplate {
  id: string
  name: string
  description: string
  language: string
  code: string
  style: 'basic' | 'notebook' | 'lined' | 'grid' | 'minimal'
  category: string
}

export default function FreeCoding() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedLanguage, setSelectedLanguage] = useState("python")
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)

  const codeTemplates: CodeTemplate[] = [
    // Python Templates
    {
      id: "py_basic",
      name: "Basic Python",
      description: "Simple Python starter template",
      language: "python",
      code: `# Python Programming
print("Hello, World!")

def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()`,
      style: 'basic',
      category: 'Starter'
    },
    {
      id: "py_notebook",
      name: "Python Notebook Style",
      description: "Jupyter-like notebook format",
      language: "python",
      code: `# %% [markdown]
# # Python Data Analysis Notebook
# This is a notebook-style template for data analysis

# %% [code]
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# %% [code]
# Load your data here
data = pd.DataFrame({
    'x': [1, 2, 3, 4, 5],
    'y': [2, 4, 6, 8, 10]
})

# %% [code]
# Analyze your data
print(data.head())

# %% [code]
# Create visualizations
plt.plot(data['x'], data['y'])
plt.title('Sample Plot')
plt.show()`,
      style: 'notebook',
      category: 'Data Science'
    },
    {
      id: "py_class",
      name: "Python Class Template",
      description: "Object-oriented programming template",
      language: "python",
      code: `# Object-Oriented Python Template
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        self.grades = []
    
    def add_grade(self, grade):
        self.grades.append(grade)
    
    def get_average(self):
        return sum(self.grades) / len(self.grades) if self.grades else 0
    
    def __str__(self):
        return f"Student: {self.name}, Age: {self.age}"

# Example usage
student = Student("Alice", 20)
student.add_grade(85)
student.add_grade(92)
print(student)
print(f"Average grade: {student.get_average()}")`,
      style: 'lined',
      category: 'OOP'
    },
    {
      id: "py_algorithm",
      name: "Algorithm Template",
      description: "Data structures and algorithms",
      language: "python",
      code: `# Algorithm Implementation Template
def binary_search(arr, target):
    """
    Binary search algorithm implementation
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test the algorithm
numbers = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binary_search(numbers, target)
print(f"Target {target} found at index: {result}")`,
      style: 'grid',
      category: 'Algorithms'
    },
    // Java Templates
    {
      id: "java_basic",
      name: "Basic Java",
      description: "Simple Java starter template",
      language: "java",
      code: `// Java Programming Template
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Your Java code here
    }
}`,
      style: 'basic',
      category: 'Starter'
    },
    {
      id: "java_oop",
      name: "Java OOP Template",
      description: "Object-oriented Java template",
      language: "java",
      code: `// Object-Oriented Java Template
class Student {
    private String name;
    private int age;
    private double[] grades;
    private int gradeCount;
    
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
        this.grades = new double[10];
        this.gradeCount = 0;
    }
    
    public void addGrade(double grade) {
        if (gradeCount < grades.length) {
            grades[gradeCount++] = grade;
        }
    }
    
    public double getAverage() {
        if (gradeCount == 0) return 0;
        double sum = 0;
        for (int i = 0; i < gradeCount; i++) {
            sum += grades[i];
        }
        return sum / gradeCount;
    }
    
    @Override
    public String toString() {
        return "Student: " + name + ", Age: " + age;
    }
}

public class Main {
    public static void main(String[] args) {
        Student student = new Student("Alice", 20);
        student.addGrade(85.5);
        student.addGrade(92.0);
        System.out.println(student);
        System.out.println("Average: " + student.getAverage());
    }
}`,
      style: 'lined',
      category: 'OOP'
    },
    // C++ Templates
    {
      id: "cpp_basic",
      name: "Basic C++",
      description: "Simple C++ starter template",
      language: "cpp",
      code: `// C++ Programming Template
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Your C++ code here
    
    return 0;
}`,
      style: 'basic',
      category: 'Starter'
    },
    {
      id: "cpp_stl",
      name: "C++ STL Template",
      description: "Standard Template Library usage",
      language: "cpp",
      code: `// C++ STL Template
#include <iostream>
#include <vector>
#include <algorithm>
#include <map>
#include <string>

using namespace std;

int main() {
    // Vector operations
    vector<int> numbers = {5, 2, 8, 1, 9};
    sort(numbers.begin(), numbers.end());
    
    cout << "Sorted numbers: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Map operations
    map<string, int> grades;
    grades["Alice"] = 85;
    grades["Bob"] = 92;
    grades["Charlie"] = 78;
    
    cout << "Student grades:" << endl;
    for (const auto& pair : grades) {
        cout << pair.first << ": " << pair.second << endl;
    }
    
    return 0;
}`,
      style: 'grid',
      category: 'STL'
    },
    // JavaScript Templates
    {
      id: "js_basic",
      name: "Basic JavaScript",
      description: "Simple JavaScript starter template",
      language: "javascript",
      code: `// JavaScript Programming Template
console.log("Hello, World!");

// Your JavaScript code here
function main() {
    // Write your code here
}

main();`,
      style: 'basic',
      category: 'Starter'
    },
    {
      id: "js_async",
      name: "Async JavaScript",
      description: "Promises and async/await template",
      language: "javascript",
      code: `// Async JavaScript Template
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Promise-based function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main async function
async function main() {
    console.log("Starting async operations...");
    
    await delay(1000);
    console.log("After 1 second delay");
    
    // Simulate API call
    const data = await fetchData('https://api.example.com/data');
    if (data) {
        console.log("Data received:", data);
    }
}

main();`,
      style: 'notebook',
      category: 'Async'
    },
    // C Templates
    {
      id: "c_basic",
      name: "Basic C",
      description: "Simple C starter template",
      language: "c",
      code: `// C Programming Template
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello, World!\\n");
    
    // Your C code here
    
    return 0;
}`,
      style: 'basic',
      category: 'Starter'
    },
    {
      id: "c_struct",
      name: "C Structures Template",
      description: "Working with structures in C",
      language: "c",
      code: `// C Structures Template
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[50];
    int age;
    float grades[5];
    int gradeCount;
} Student;

void addGrade(Student* student, float grade) {
    if (student->gradeCount < 5) {
        student->grades[student->gradeCount++] = grade;
    }
}

float getAverage(Student* student) {
    if (student->gradeCount == 0) return 0;
    float sum = 0;
    for (int i = 0; i < student->gradeCount; i++) {
        sum += student->grades[i];
    }
    return sum / student->gradeCount;
}

int main() {
    Student student;
    strcpy(student.name, "Alice");
    student.age = 20;
    student.gradeCount = 0;
    
    addGrade(&student, 85.5);
    addGrade(&student, 92.0);
    
    printf("Student: %s, Age: %d\\n", student.name, student.age);
    printf("Average grade: %.2f\\n", getAverage(&student));
    
    return 0;
}`,
      style: 'lined',
      category: 'Structures'
    }
  ]

  // Get filtered templates for current language
  const getTemplatesForLanguage = (language: string) => {
    return codeTemplates.filter(template => template.language === language)
  }

  // Load default template when language changes
  useEffect(() => {
    const templates = getTemplatesForLanguage(selectedLanguage)
    if (templates.length > 0) {
      setCode(templates[0].code)
    }
  }, [selectedLanguage])

  // Apply selected template
  const applyTemplate = (template: CodeTemplate) => {
    setCode(template.code)
    setSelectedTemplate(template)
    setShowTemplates(false)
    toast({
      title: "Template Applied",
      description: `${template.name} template loaded successfully`,
    })
  }

  const handleRunCode = () => {
    setIsRunning(true)
    // Simulate code execution
    setTimeout(() => {
      setOutput(`Code executed successfully!\nLanguage: ${selectedLanguage.toUpperCase()}\nOutput: Hello, World!`)
      setIsRunning(false)
      toast({
        title: "Code Executed",
        description: "Your code has been executed successfully.",
      })
    }, 2000)
  }

  const handleSaveCode = () => {
    const savedDraft = {
      id: Date.now().toString(),
      language: selectedLanguage,
      code: code,
      template: selectedTemplate?.name || "Custom",
      timestamp: new Date().toISOString(),
      title: `${selectedLanguage} Draft - ${new Date().toLocaleDateString()}`
    }
    
    const existingDrafts = JSON.parse(localStorage.getItem("free_coding_drafts") || "[]")
    const updatedDrafts = [savedDraft, ...existingDrafts]
    localStorage.setItem("free_coding_drafts", JSON.stringify(updatedDrafts))
    
    toast({
      title: "Code Saved to Drafts",
      description: "Your code has been saved to free coding drafts.",
    })
  }

  const handleResetCode = () => {
    const templates = getTemplatesForLanguage(selectedLanguage)
    if (templates.length > 0) {
      setCode(templates[0].code)
      setSelectedTemplate(templates[0])
    }
    setOutput("")
    toast({
      title: "Code Reset",
      description: "Code has been reset to default template.",
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code Copied",
      description: "Code has been copied to clipboard.",
    })
  }

  const handleClearAll = () => {
    setCode("")
    setOutput("")
    setSelectedTemplate(null)
    toast({
      title: "Cleared",
      description: "Editor and output cleared.",
    })
  }

  const handleDownloadCode = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    
    const extension = selectedLanguage === 'cpp' ? 'cpp' : 
                     selectedLanguage === 'javascript' ? 'js' : 
                     selectedLanguage === 'python' ? 'py' :
                     selectedLanguage === 'java' ? 'java' : 'c'
    
    element.download = `code.${extension}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    toast({
      title: "Code Downloaded",
      description: `Code file downloaded as code.${extension}`,
    })
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard/compiler')
  }

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'notebook': return BookOpen
      case 'lined': return FileText
      case 'grid': return Grid
      case 'minimal': return Layers
      default: return Code
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Free Coding Environment
          </h1>
          <p className="text-gray-600 text-lg">
            Practice coding with real-time compilation and execution
          </p>
        </motion.div>

        {/* Language Selection and Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Programming Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Templates</label>
                <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Load Template ({getTemplatesForLanguage(selectedLanguage).length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Choose a Template for {selectedLanguage.toUpperCase()}</DialogTitle>
                      <p className="text-sm text-gray-600">Select a template to instantly apply to your code editor</p>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                      {getTemplatesForLanguage(selectedLanguage).map((template) => {
                        const StyleIcon = getStyleIcon(template.style)
                        
                        // Create visual style based on template type
                        const getVisualStyle = () => {
                          switch (template.style) {
                            case 'notebook':
                              return (
                                <div className="relative bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[200px] shadow-sm">
                                  {/* Notebook binding holes */}
                                  <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-evenly">
                                    {[...Array(8)].map((_, i) => (
                                      <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    ))}
                                  </div>
                                  {/* Margin line */}
                                  <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300"></div>
                                  {/* Horizontal lines */}
                                  <div className="ml-6 space-y-3">
                                    {[...Array(8)].map((_, i) => (
                                      <div key={i} className="h-px bg-blue-200"></div>
                                    ))}
                                  </div>
                                  {/* Code preview */}
                                  <div className="absolute inset-0 ml-10 mt-2">
                                    <pre className="text-xs text-blue-800 font-mono leading-relaxed">
                                      {template.code.split('\n').slice(0, 8).map((line, i) => (
                                        <div key={i} className="mb-3 truncate">{line}</div>
                                      ))}
                                    </pre>
                                  </div>
                                </div>
                              )
                            case 'lined':
                              return (
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[200px] shadow-sm">
                                  {/* Lined paper effect */}
                                  <div className="space-y-4">
                                    {[...Array(8)].map((_, i) => (
                                      <div key={i} className="border-b border-gray-300 pb-2">
                                        <div className="text-xs text-gray-700 font-mono truncate">
                                          {template.code.split('\n')[i] || ''}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            case 'grid':
                              return (
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[200px] shadow-sm relative">
                                  {/* Grid pattern */}
                                  <div 
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                      backgroundImage: `
                                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                                      `,
                                      backgroundSize: '20px 20px'
                                    }}
                                  ></div>
                                  {/* Code preview */}
                                  <div className="relative z-10">
                                    <pre className="text-xs text-gray-700 font-mono">
                                      {template.code.split('\n').slice(0, 8).join('\n')}
                                    </pre>
                                  </div>
                                </div>
                              )
                            case 'minimal':
                              return (
                                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 min-h-[200px] shadow-sm">
                                  <pre className="text-xs text-gray-600 font-mono leading-relaxed">
                                    {template.code.split('\n').slice(0, 8).join('\n')}
                                  </pre>
                                </div>
                              )
                            default: // basic
                              return (
                                <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 min-h-[200px] shadow-sm">
                                  <pre className="text-xs text-green-400 font-mono">
                                    {template.code.split('\n').slice(0, 8).join('\n')}
                                  </pre>
                                </div>
                              )
                          }
                        }
                        
                        return (
                          <Card 
                            key={template.id} 
                            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 hover:scale-[1.02] group"
                            onClick={() => applyTemplate(template)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold group-hover:text-purple-600 transition-colors">
                                  {template.name}
                                </CardTitle>
                                <StyleIcon className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                                <Badge variant="outline" className="text-xs capitalize">{template.style}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {getVisualStyle()}
                              <div className="mt-3 flex justify-center">
                                <Button 
                                  size="sm" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    applyTemplate(template)
                                  }}
                                >
                                  Apply Template
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    
                    {/* Template Style Legend */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-3">Template Styles:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span>Notebook - Jupyter-like format</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>Lined - Structured layout</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Grid className="h-4 w-4 text-purple-600" />
                          <span>Grid - Algorithm focus</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-orange-600" />
                          <span>Minimal - Clean design</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-gray-600" />
                          <span>Basic - Terminal style</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? "Running..." : "Run Code"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveCode}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save to Drafts
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyCode}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCode}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Code Editor and Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden"
          >
            <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="font-medium">Code Editor</span>
                <span className="text-gray-400">({selectedLanguage.toUpperCase()})</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-0">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[500px] font-mono text-sm border-0 resize-none focus:ring-0 bg-gray-900 text-green-400 p-4"
                placeholder="Write your code here..."
              />
            </div>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden"
          >
            <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="font-medium">Output</span>
                {isRunning && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Running...</span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-gray-900 min-h-[500px]">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {output || "Click 'Run Code' to see output here..."}
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => setShowTemplates(true)}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">Browse Templates</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleClearAll}
            >
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">Clear All</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleDownloadCode}
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Download Code</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back to Dashboard</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
