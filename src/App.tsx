import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy,
  Check,
  Plus, 
  Minus,
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Search,
  Replace,
  FileDown,
  CheckCircle2,
  Download, 
  Upload,
  FileText, 
  UserPlus, 
  Palette,
  X,
  Settings2,
  LayoutGrid,
  Type,
  Volume2,
  Camera,
  MessageSquare,
  Undo2,
  Redo2,
  Moon,
  Sun,
  Layers,
  FolderPlus,
  MoreVertical,
  GripVertical,
  BookOpen,
  AlertTriangle,
  HelpCircle,
  Mail,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from './lib/utils';

interface Cut {
  id: string;
  angle: string;
  description: string;
  soundEffect: string;
  dialogue: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  sequenceId: string;
}

interface Sequence {
  id: string;
  title: string;
}

interface Character {
  id: string;
  name: string;
  color: string;
}

interface Angle {
  id: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  sequences: Sequence[];
  cuts: Cut[];
  characters: Character[];
  angles: Angle[];
  history: any[];
  historyIndex: number;
  focusedCutId: string | null;
}

export default function App() {
  const [title, setTitle] = useState('새로운 웹툰 콘티');
  const [sequences, setSequences] = useState<Sequence[]>([
    { id: 'seq-1', title: '시퀀스 1' }
  ]);
  const [cuts, setCuts] = useState<Cut[]>([
    { id: '1', angle: '', description: '', soundEffect: '', dialogue: '', size: 'M', sequenceId: 'seq-1' }
  ]);
  const [characters, setCharacters] = useState<Character[]>([
    { id: 'c1', name: '홍길동', color: '#4f46e5' },
    { id: 'c2', name: '성춘향', color: '#db2777' }
  ]);
  const [angles, setAngles] = useState<Angle[]>([
    { id: 'a1', name: '하이앵글' },
    { id: 'a2', name: '로우앵글' },
    { id: 'a3', name: '아이레벨' },
    { id: 'a4', name: '더치앵글' },
    { id: 'a5', name: '버드아이뷰' },
    { id: 'a6', name: '웜즈아이뷰' },
    { id: 'a7', name: '오버더숄더' },
    { id: 'a8', name: '익스트림 롱샷' },
    { id: 'a9', name: '롱샷' },
    { id: 'a10', name: '풀샷' },
    { id: 'a11', name: '니샷' },
    { id: 'a12', name: '웨이스트샷' },
    { id: 'a13', name: '바스트샷' },
    { id: 'a14', name: '클로즈업' },
    { id: 'a15', name: '익스트림 클로즈업' }
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth * 0.45);
  const [isResizing, setIsResizing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [popupDirection, setPopupDirection] = useState<'up' | 'down'>('up');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [libraryFeedback, setLibraryFeedback] = useState<{type: 'characters' | 'angles', message: string} | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showAngleGuideModal, setShowAngleGuideModal] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Temporarily disabled to allow the user to verify the name change on the landing page
    // const hasSeenLanding = localStorage.getItem('hasSeenLanding');
    // if (hasSeenLanding) {
    //   setShowLanding(false);
    // }
  }, []);

  const handleStart = () => {
    localStorage.setItem('hasSeenLanding', 'true');
    setShowLanding(false);
  };

  const getContrastColor = (hexcolor: string) => {
    if (!hexcolor || hexcolor.length < 7) return '#ffffff';
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  const renderDialogue = (text: string, isSidebar: boolean = false) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\]:)/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[([^\]]+)\]:$/);
      if (match) {
        const charName = match[1];
        const character = characters.find(c => c.name === charName);
        if (character) {
          const bgColor = character.color || '#4f46e5';
          const textColor = getContrastColor(bgColor);
          return (
            <span 
              key={i} 
              className={cn(
                "inline-block rounded-md font-black shadow-sm align-baseline break-keep",
                isSidebar ? "px-1 py-0 text-[0.85em] mr-1" : "px-2 py-0.5 text-[0.9em] mr-1.5"
              )}
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              {part}
            </span>
          );
        }
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const [activeProjectId, setActiveProjectId] = useState<string>('p1');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'p1',
      title: '새로운 웹툰 콘티',
      sequences: [{ id: 'seq-1', title: '시퀀스 1' }],
      cuts: [{ id: '1', angle: '', description: '', soundEffect: '', dialogue: '', size: 'M', sequenceId: 'seq-1' }],
      characters: [{ id: 'c1', name: '홍길동', color: '#4f46e5' }, { id: 'c2', name: '성춘향', color: '#db2777' }],
      angles: [
        { id: 'a1', name: '하이앵글' },
        { id: 'a2', name: '로우앵글' },
        { id: 'a3', name: '아이레벨' },
        { id: 'a4', name: '더치앵글' },
        { id: 'a5', name: '버드아이뷰' },
        { id: 'a6', name: '웜즈아이뷰' },
        { id: 'a7', name: '오버더숄더' },
        { id: 'a8', name: '익스트림 롱샷' },
        { id: 'a9', name: '롱샷' },
        { id: 'a10', name: '풀샷' },
        { id: 'a11', name: '니샷' },
        { id: 'a12', name: '웨이스트샷' },
        { id: 'a13', name: '바스트샷' },
        { id: 'a14', name: '클로즈업' },
        { id: 'a15', name: '익스트림 클로즈업' }
      ],
      history: [],
      historyIndex: -1,
      focusedCutId: '1'
    }
  ]);

  const [newCharName, setNewCharName] = useState('');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4f46e5');
  const presetColors = [
    '#4f46e5', '#db2777', '#059669', '#d97706', '#dc2626', 
    '#7c3aed', '#2563eb', '#0891b2', '#4b5563', '#111827'
  ];
  const [newAngleName, setNewAngleName] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'dialogue' | 'description'>('all');
  const [showCharModal, setShowCharModal] = useState(false);
  const [showAngleModal, setShowAngleModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);
  const [focusedCutId, setFocusedCutId] = useState<string | null>(null);
  const [isDialogueFocused, setIsDialogueFocused] = useState(false);
  const [isAngleFocused, setIsAngleFocused] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [copied, setCopied] = useState(false);

  const switchProject = (newProjectId: string) => {
    if (newProjectId === activeProjectId) return;
    
    setIsInternalUpdate(true);
    
    // Save current state to projects array
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          title,
          sequences,
          cuts,
          characters,
          angles,
          history,
          historyIndex,
          focusedCutId
        };
      }
      return p;
    }));

    // Load new state
    const targetProject = projects.find(p => p.id === newProjectId);
    if (targetProject) {
      setTitle(targetProject.title);
      setSequences(targetProject.sequences);
      setCuts(targetProject.cuts);
      setCharacters(targetProject.characters);
      setAngles(targetProject.angles);
      setHistory(targetProject.history);
      setHistoryIndex(targetProject.historyIndex);
      setFocusedCutId(targetProject.focusedCutId);
      setActiveProjectId(newProjectId);
    }
    
    setTimeout(() => setIsInternalUpdate(false), 0);
  };

  const addProject = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newProject: Project = {
      id: newId,
      title: '새로운 웹툰 콘티',
      sequences: [{ id: `seq-${Date.now()}`, title: '시퀀스 1' }],
      cuts: [{ id: Date.now().toString(), angle: '', description: '', soundEffect: '', dialogue: '', size: 'M', sequenceId: `seq-${Date.now()}` }],
      characters: [{ id: 'c1', name: '홍길동', color: '#4f46e5' }, { id: 'c2', name: '성춘향', color: '#db2777' }],
      angles: [
        { id: 'a1', name: '하이앵글' },
        { id: 'a2', name: '로우앵글' },
        { id: 'a3', name: '아이레벨' },
        { id: 'a4', name: '더치앵글' },
        { id: 'a5', name: '버드아이뷰' },
        { id: 'a6', name: '웜즈아이뷰' },
        { id: 'a7', name: '오버더숄더' },
        { id: 'a8', name: '익스트림 롱샷' },
        { id: 'a9', name: '롱샷' },
        { id: 'a10', name: '풀샷' },
        { id: 'a11', name: '니샷' },
        { id: 'a12', name: '웨이스트샷' },
        { id: 'a13', name: '바스트샷' },
        { id: 'a14', name: '클로즈업' },
        { id: 'a15', name: '익스트림 클로즈업' }
      ],
      history: [],
      historyIndex: -1,
      focusedCutId: Date.now().toString()
    };

    // Save current state before adding new one
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            title,
            sequences,
            cuts,
            characters,
            angles,
            history,
            historyIndex,
            focusedCutId
          };
        }
        return p;
      });
      return [...updated, newProject];
    });

    // Switch to new project
    setIsInternalUpdate(true);
    setTitle(newProject.title);
    setSequences(newProject.sequences);
    setCuts(newProject.cuts);
    setCharacters(newProject.characters);
    setAngles(newProject.angles);
    setHistory(newProject.history);
    setHistoryIndex(newProject.historyIndex);
    setFocusedCutId(newProject.focusedCutId);
    setActiveProjectId(newId);
    setTimeout(() => setIsInternalUpdate(false), 0);
  };

  const closeProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (projects.length === 1) return;
    
    setPendingDeleteProjectId(projectId);
    setShowCloseConfirmModal(true);
  };

  const confirmCloseProject = () => {
    if (!pendingDeleteProjectId) return;
    
    const projectId = pendingDeleteProjectId;
    const index = projects.findIndex(p => p.id === projectId);
    const newProjects = projects.filter(p => p.id !== projectId);
    setProjects(newProjects);
    
    if (projectId === activeProjectId) {
      const nextProject = newProjects[Math.max(0, index - 1)];
      setIsInternalUpdate(true);
      setTitle(nextProject.title);
      setSequences(nextProject.sequences);
      setCuts(nextProject.cuts);
      setCharacters(nextProject.characters);
      setAngles(nextProject.angles);
      setHistory(nextProject.history);
      setHistoryIndex(nextProject.historyIndex);
      setFocusedCutId(nextProject.focusedCutId);
      setActiveProjectId(nextProject.id);
      setTimeout(() => setIsInternalUpdate(false), 0);
    }

    setPendingDeleteProjectId(null);
    setShowCloseConfirmModal(false);
  };

  // Undo/Redo Logic
  const saveToHistory = (newState: any) => {
    if (isInternalUpdate) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newState));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    setIsInternalUpdate(true);
    const prevIndex = historyIndex - 1;
    const prevState = JSON.parse(history[prevIndex]);
    setTitle(prevState.title);
    setCuts(prevState.cuts);
    setSequences(prevState.sequences);
    setCharacters(prevState.characters);
    setAngles(prevState.angles);
    setHistoryIndex(prevIndex);
    setTimeout(() => setIsInternalUpdate(false), 0);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setIsInternalUpdate(true);
    const nextIndex = historyIndex + 1;
    const nextState = JSON.parse(history[nextIndex]);
    setTitle(nextState.title);
    setCuts(nextState.cuts);
    setSequences(nextState.sequences);
    setCharacters(nextState.characters);
    setAngles(nextState.angles);
    setHistoryIndex(nextIndex);
    setTimeout(() => setIsInternalUpdate(false), 0);
  };

  // Reorder cuts
  const handleReorder = (newCuts: Cut[]) => {
    setCuts(newCuts);
    saveToHistory({ title, sequences, cuts: newCuts, characters, angles });
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 1000) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('webtoon-script');
    const savedTheme = localStorage.getItem('webtoon-theme');
    const savedWidth = localStorage.getItem('webtoon-sidebar-width');
    const savedFontSize = localStorage.getItem('webtoon-font-size');
    
    if (savedTheme === 'dark') setIsDarkMode(true);
    if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth, 10));
    } else {
      setSidebarWidth(window.innerWidth * 0.4);
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || '새로운 웹툰 콘티');
        setSequences(parsed.sequences || [{ id: 'seq-1', title: '시퀀스 1' }]);
        setCuts(parsed.cuts || [{ id: '1', angle: '', description: '', soundEffect: '', dialogue: '', size: 'M', sequenceId: 'seq-1' }]);
        
        // Load characters: prefer project data, fallback to global library
        const projectChars = parsed.characters || [];
        if (projectChars.length > 0) {
          setCharacters(projectChars);
        } else {
          const globalChars = localStorage.getItem('webtoon-characters-library');
          if (globalChars) setCharacters(JSON.parse(globalChars));
        }

        // Load angles: prefer project data, fallback to global library
        const projectAngles = parsed.angles || [];
        if (projectAngles.length > 0) {
          setAngles(projectAngles);
        } else {
          const globalAngles = localStorage.getItem('webtoon-angles-library');
          if (globalAngles) setAngles(JSON.parse(globalAngles));
        }
        
        // Initial history
        const initialState = {
          title: parsed.title || '새로운 웹툰 콘티',
          sequences: parsed.sequences || [{ id: 'seq-1', title: '시퀀스 1' }],
          cuts: parsed.cuts || [{ id: '1', angle: '', description: '', soundEffect: '', dialogue: '', size: 'M', sequenceId: 'seq-1' }],
          characters: parsed.characters || [],
          angles: parsed.angles || angles
        };
        setHistory([JSON.stringify(initialState)]);
        setHistoryIndex(0);
      } catch (e) {
        console.error('Failed to load saved script', e);
      }
    } else {
      // New project: try to load from global library
      const globalChars = localStorage.getItem('webtoon-characters-library');
      if (globalChars) setCharacters(JSON.parse(globalChars));
      
      const globalAngles = localStorage.getItem('webtoon-angles-library');
      if (globalAngles) setAngles(JSON.parse(globalAngles));

      const initialState = { title, sequences, cuts, characters, angles };
      setHistory([JSON.stringify(initialState)]);
      setHistoryIndex(0);
    }
  }, []);

  // Save script to local storage on change
  useEffect(() => {
    localStorage.setItem('webtoon-script', JSON.stringify({ title, cuts, characters, angles, sequences }));
    
    // Automatically sync to global library
    if (characters.length > 0) {
      localStorage.setItem('webtoon-characters-library', JSON.stringify(characters));
    }
    if (angles.length > 0) {
      localStorage.setItem('webtoon-angles-library', JSON.stringify(angles));
    }

    if (!isInternalUpdate) {
      saveToHistory({ title, cuts, characters, angles, sequences });
    }
  }, [title, cuts, characters, angles, sequences]);

  // Save UI preferences to local storage
  useEffect(() => {
    localStorage.setItem('webtoon-sidebar-width', sidebarWidth.toString());
    localStorage.setItem('webtoon-font-size', fontSize.toString());
    localStorage.setItem('webtoon-theme', isDarkMode ? 'dark' : 'light');
  }, [sidebarWidth, fontSize, isDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const updatePopupDirection = (e: React.FocusEvent) => {
    const rect = e.target.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // If the element is in the top half of the screen, show popup below (down)
    // Otherwise show popup above (up)
    if (rect.top < viewportHeight / 2) {
      setPopupDirection('down');
    } else {
      setPopupDirection('up');
    }
  };

  const scrollToCut = (id: string) => {
    setFocusedCutId(id);
    const element = editorRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const addSequence = () => {
    const newSeq: Sequence = {
      id: `seq-${Date.now()}`,
      title: `새 시퀀스 ${sequences.length + 1}`
    };
    setSequences([...sequences, newSeq]);
  };

  const updateSequenceTitle = (id: string, newTitle: string) => {
    setSequences(sequences.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const deleteSequence = (id: string) => {
    if (sequences.length === 1) return;
    // Move cuts to another sequence or delete them? Let's move them to the first available sequence
    const remainingSeqs = sequences.filter(s => s.id !== id);
    const targetSeqId = remainingSeqs[0].id;
    setCuts(cuts.map(c => c.sequenceId === id ? { ...c, sequenceId: targetSeqId } : c));
    setSequences(remainingSeqs);
  };

  const handleKeyDown = (e: React.KeyboardEvent, cutId: string, field: string) => {
    const fieldOrder = ['angle', 'soundEffect', 'description', 'dialogue'];
    const cutIndex = cuts.findIndex(c => c.id === cutId);
    const fieldIndex = fieldOrder.indexOf(field);

    const focusElement = (cIdx: number, fIdx: number) => {
      const targetCut = cuts[cIdx];
      if (!targetCut) return;
      const targetField = fieldOrder[fIdx];
      const el = document.querySelector(`[data-cut-id="${targetCut.id}"][data-field="${targetField}"]`) as HTMLElement;
      if (el) {
        el.focus();
      }
    };

    if (e.key === 'ArrowDown') {
      if (e.currentTarget instanceof HTMLTextAreaElement) {
        const lines = e.currentTarget.value.split('\n');
        const currentLine = e.currentTarget.value.substring(0, e.currentTarget.selectionEnd).split('\n').length;
        if (currentLine < lines.length) return;
      }
      if (cutIndex < cuts.length - 1) {
        e.preventDefault();
        focusElement(cutIndex + 1, fieldIndex);
      }
    } else if (e.key === 'ArrowUp') {
      if (e.currentTarget instanceof HTMLTextAreaElement) {
        const currentLine = e.currentTarget.value.substring(0, e.currentTarget.selectionStart).split('\n').length;
        if (currentLine > 1) return;
      }
      if (cutIndex > 0) {
        e.preventDefault();
        focusElement(cutIndex - 1, fieldIndex);
      }
    } else if (e.key === 'ArrowRight') {
      if (e.currentTarget instanceof HTMLInputElement || e.currentTarget instanceof HTMLTextAreaElement) {
        if (e.currentTarget.selectionEnd !== null && e.currentTarget.selectionEnd < e.currentTarget.value.length) return;
      }
      e.preventDefault();
      if (fieldIndex < fieldOrder.length - 1) {
        focusElement(cutIndex, fieldIndex + 1);
      } else if (cutIndex < cuts.length - 1) {
        focusElement(cutIndex + 1, 0);
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.currentTarget instanceof HTMLInputElement || e.currentTarget instanceof HTMLTextAreaElement) {
        if (e.currentTarget.selectionStart !== null && e.currentTarget.selectionStart > 0) return;
      }
      e.preventDefault();
      if (fieldIndex > 0) {
        focusElement(cutIndex, fieldIndex - 1);
      } else if (cutIndex > 0) {
        focusElement(cutIndex - 1, fieldOrder.length - 1);
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addCut(cutIndex + 1, cuts[cutIndex].sequenceId);
    } else if (e.key === 'Backspace' && (e.ctrlKey || e.metaKey)) {
      if (cuts.length > 1) {
        e.preventDefault();
        deleteCut(cutId);
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
      
      // Export
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowExportModal(true);
      }

      // Modals & Theme (Alt shortcuts)
      if (e.altKey) {
        if (e.key === 'c') {
          e.preventDefault();
          setShowCharModal(prev => !prev);
        }
        if (e.key === 'a') {
          e.preventDefault();
          setShowAngleModal(prev => !prev);
        }
        if (e.key === 'd') {
          e.preventDefault();
          setIsDarkMode(prev => !prev);
        }
        if (e.key === 'h') {
          e.preventDefault();
          setShowShortcutsModal(prev => !prev);
        }
        
        // Size shortcuts (Alt + 1-5)
        const sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[] = ['XS', 'S', 'M', 'L', 'XL'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5 && focusedCutId) {
          e.preventDefault();
          updateCut(focusedCutId, 'size', sizes[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [historyIndex, history, focusedCutId, cuts, sequences, characters, angles, isDarkMode]);

  const addCut = (index?: number, sequenceId?: string) => {
    const targetSeqId = sequenceId || (cuts.length > 0 ? cuts[cuts.length - 1].sequenceId : sequences[0].id);
    const newCut: Cut = {
      id: Math.random().toString(36).substr(2, 9),
      angle: '',
      description: '',
      soundEffect: '',
      dialogue: '',
      size: 'M',
      sequenceId: targetSeqId
    };
    
    if (typeof index === 'number') {
      const newCuts = [...cuts];
      newCuts.splice(index, 0, newCut);
      setCuts(newCuts);
    } else {
      setCuts([...cuts, newCut]);
    }
    
    setFocusedCutId(newCut.id);
  };

  const updateCut = (id: string, field: keyof Cut, value: any) => {
    setCuts(cuts.map(cut => cut.id === id ? { ...cut, [field]: value } : cut));
  };

  const deleteCut = (id: string) => {
    if (cuts.length === 1) return;
    setCuts(cuts.filter(cut => cut.id !== id));
  };

  const moveCut = (index: number, direction: 'up' | 'down') => {
    const newCuts = [...cuts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cuts.length) return;
    [newCuts[index], newCuts[targetIndex]] = [newCuts[targetIndex], newCuts[index]];
    setCuts(newCuts);
  };

  const addCharacter = () => {
    if (!newCharName.trim()) return;
    const newChar = { 
      id: Date.now().toString(), 
      name: newCharName.trim(),
      color: selectedColor 
    };
    setCharacters([...characters, newChar]);
    setNewCharName('');
    setSelectedCharId(newChar.id);
  };

  const updateCharacterColor = (id: string, color: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, color } : c));
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const addAngle = () => {
    if (!newAngleName.trim()) return;
    setAngles([...angles, { id: Date.now().toString(), name: newAngleName.trim() }]);
    setNewAngleName('');
  };

  const removeAngle = (id: string) => {
    setAngles(angles.filter(a => a.id !== id));
  };

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    
    const newCuts = cuts.map(cut => {
      const newCut = { ...cut };
      if (searchTarget === 'all' || searchTarget === 'dialogue') {
        newCut.dialogue = cut.dialogue.replaceAll(searchQuery, replaceQuery);
      }
      if (searchTarget === 'all' || searchTarget === 'description') {
        newCut.description = cut.description.replaceAll(searchQuery, replaceQuery);
      }
      return newCut;
    });
    
    setCuts(newCuts);
    // Add to history
    const newProject = {
      ...projects.find(p => p.id === activeProjectId)!,
      cuts: newCuts
    };
    saveToHistory(newProject);
    setSearchQuery('');
    setReplaceQuery('');
    setShowSearchModal(false);
  };

  const exportToTxt = () => {
    let content = `[${title}]\n\n`;
    sequences.forEach(seq => {
      content += `### ${seq.title}\n\n`;
      const seqCuts = cuts.filter(c => c.sequenceId === seq.id);
      seqCuts.forEach((cut, idx) => {
        content += `CUT ${idx + 1} (${cut.size})\n`;
        if (cut.angle) content += `앵글: ${cut.angle}\n`;
        if (cut.soundEffect) content += `효과음: ${cut.soundEffect}\n`;
        if (cut.description) content += `상황: ${cut.description}\n`;
        if (cut.dialogue) content += `대사: ${cut.dialogue}\n`;
        content += `\n`;
      });
      content += `-------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`;
    link.click();
    setShowExportModal(false);
  };

  const exportToDoc = (ext: 'doc' | 'hwp') => {
    let content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; }
        h1 { text-align: center; color: #4f46e5; }
        .sequence { margin-top: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .cut { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; }
        .cut-header { font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
        .label { font-weight: bold; color: #666; width: 80px; display: inline-block; }
        .dialogue { background: #f9f9f9; padding: 10px; border-left: 4px solid #4f46e5; margin-top: 10px; }
      </style>
      </head>
      <body>
        <h1>${title}</h1>
    `;

    sequences.forEach(seq => {
      content += `<div class="sequence"><h2>${seq.title}</h2></div>`;
      const seqCuts = cuts.filter(c => c.sequenceId === seq.id);
      seqCuts.forEach((cut, idx) => {
        content += `
          <div class="cut">
            <div class="cut-header">CUT ${idx + 1} (${cut.size})</div>
            ${cut.angle ? `<div><span class="label">앵글:</span> ${cut.angle}</div>` : ''}
            ${cut.soundEffect ? `<div><span class="label">효과음:</span> ${cut.soundEffect}</div>` : ''}
            ${cut.description ? `<div><span class="label">상황:</span> ${cut.description}</div>` : ''}
            ${cut.dialogue ? `<div class="dialogue">${cut.dialogue.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        `;
      });
    });

    content += `</body></html>`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.${ext}`;
    link.click();
    setShowExportModal(false);
  };

  const insertCharacter = (charName: string) => {
    if (!focusedCutId) return;
    const cut = cuts.find(c => c.id === focusedCutId);
    if (!cut) return;
    
    const prefix = `[${charName}]: `;
    const currentDialogue = cut.dialogue;
    
    let newValue;
    if (!currentDialogue.trim()) {
      newValue = prefix;
    } else {
      // If there's already text, add a newline before the new character prefix
      newValue = currentDialogue.endsWith('\n') 
        ? currentDialogue + prefix 
        : currentDialogue + '\n' + prefix;
    }
    
    updateCut(focusedCutId, 'dialogue', newValue);
  };

  const insertAngle = (angleName: string) => {
    if (!focusedCutId) return;
    updateCut(focusedCutId, 'angle', angleName);
  };

  const tutorialSteps = [
    {
      title: "아이스 스크립툰(Ice Scriptoon)에 오신 것을 환영합니다! 👋",
      description: "이 에디터는 웹툰 작가님들이 더 효율적으로 콘티를 작성할 수 있도록 설계되었습니다. 주요 기능들을 빠르게 살펴볼까요?",
      icon: <LayoutGrid className="text-indigo-500" size={48} />
    },
    {
      title: "시퀀스 관리 (왼쪽 창)",
      description: "이야기를 큰 단위인 '시퀀스'로 나누어 관리하세요. 드래그 앤 드롭으로 순서를 바꾸거나, 제목을 클릭해 수정할 수 있습니다.",
      icon: <Layers className="text-blue-500" size={48} />
    },
    {
      title: "컷 편집 (오른쪽 창)",
      description: "각 컷의 앵글, 연출 설명, 대사, 효과음을 입력하세요. 탭(Tab) 키를 이용해 빠르게 다음 필드로 이동할 수 있습니다.",
      icon: <Type className="text-green-500" size={48} />
    },
    {
      title: "인물 및 앵글 관리",
      description: "자주 사용하는 인물과 앵글을 미리 등록해두세요. 대사 창에서 '@'를 입력해 인물을, 앵글 창에서 '/'를 입력해 앵글을 빠르게 선택할 수 있습니다.",
      icon: <UserPlus className="text-purple-500" size={48} />
    },
    {
      title: "찾기 및 바꾸기",
      description: "Ctrl + F를 눌러 특정 단어를 찾거나 한꺼번에 바꿀 수 있습니다. 대사만 골라서 바꾸거나 연출 설명만 골라서 바꿀 수도 있어요.",
      icon: <Search className="text-orange-500" size={48} />
    },
    {
      title: "통합 내보내기",
      description: "작업이 완료되면 Ctrl + S 또는 우측 상단의 '내보내기' 버튼을 누르세요. PDF, 텍스트, 한글(.hwp) 등 다양한 형식으로 저장할 수 있습니다.",
      icon: <Download className="text-indigo-600" size={48} />
    },
    {
      title: "유용한 단축키",
      description: "Alt + C(인물), Alt + A(앵글), Alt + S(찾기/바꾸기) 등 다양한 단축키로 작업 속도를 높여보세요. 설정 아이콘을 누르면 전체 목록을 볼 수 있습니다.",
      icon: <Settings2 className="text-gray-500" size={48} />
    }
  ];

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const saveToLibrary = (type: 'characters' | 'angles') => {
    const data = type === 'characters' ? characters : angles;
    localStorage.setItem(`webtoon-${type}-library`, JSON.stringify(data));
    setLibraryFeedback({ type, message: '라이브러리에 저장되었습니다!' });
    setTimeout(() => setLibraryFeedback(null), 2000);
  };

  const loadFromLibrary = (type: 'characters' | 'angles') => {
    const saved = localStorage.getItem(`webtoon-${type}-library`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (type === 'characters') setCharacters(parsed);
        else setAngles(parsed);
        setLibraryFeedback({ type, message: '라이브러리를 불러왔습니다!' });
        setTimeout(() => setLibraryFeedback(null), 2000);
      } catch (e) {
        console.error('Failed to load library', e);
      }
    } else {
      setLibraryFeedback({ type, message: '저장된 라이브러리가 없습니다.' });
      setTimeout(() => setLibraryFeedback(null), 2000);
    }
  };

  const exportLibrary = (type: 'characters' | 'angles') => {
    const data = type === 'characters' ? characters : angles;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webtoon-${type}-library.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importLibrary = (type: 'characters' | 'angles', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          if (type === 'characters') setCharacters(parsed);
          else setAngles(parsed);
          setLibraryFeedback({ type, message: '파일에서 라이브러리를 가져왔습니다!' });
          setTimeout(() => setLibraryFeedback(null), 2000);
        }
      } catch (err) {
        console.error('Failed to import library', err);
        setLibraryFeedback({ type, message: '파일 형식이 올바르지 않습니다.' });
        setTimeout(() => setLibraryFeedback(null), 2000);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const copyToClipboard = () => {
    const content = cuts.map((cut, i) => {
      return `[CUT ${i + 1}]\n앵글: ${cut.angle}\n상황/액션: ${cut.description}\n효과음: ${cut.soundEffect}\n대사: ${cut.dialogue}\n------------------\n`;
    }).join('\n');
    
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const importText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      let newTitle = '새로운 웹툰 콘티';
      const newCuts: Cut[] = [];
      let currentCut: any = null;
      let currentField: string | null = null;

      let titleFound = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!titleFound) {
          if (line) {
            newTitle = line;
            titleFound = true;
          }
          continue;
        }

        if (line.startsWith('[CUT')) {
          if (currentCut) newCuts.push(currentCut);
          currentCut = {
            id: Math.random().toString(36).substr(2, 9),
            angle: '',
            description: '',
            soundEffect: '',
            dialogue: '',
            size: 'M',
            sequenceId: sequences[0].id
          };
          currentField = null;
          continue;
        }

        if (currentCut) {
          if (line.startsWith('앵글:')) {
            currentCut.angle = line.replace('앵글:', '').trim();
            currentField = 'angle';
          } else if (line.startsWith('상황/액션:')) {
            currentCut.description = line.replace('상황/액션:', '').trim();
            currentField = 'description';
          } else if (line.startsWith('효과음:')) {
            currentCut.soundEffect = line.replace('효과음:', '').trim();
            currentField = 'soundEffect';
          } else if (line.startsWith('대사:')) {
            currentCut.dialogue = line.replace('대사:', '').trim();
            currentField = 'dialogue';
          } else if (line === '------------------') {
            currentField = null;
          } else if (currentField) {
            // Use lines[i] instead of line to preserve leading spaces if any, 
            // though we trimmed line for checks.
            const rawLine = lines[i];
            if (rawLine.trim() || currentCut[currentField]) {
              currentCut[currentField] += (currentCut[currentField] ? '\n' : '') + rawLine;
            }
          }
        }
      }
      if (currentCut) newCuts.push(currentCut);

      if (newCuts.length > 0) {
        const newId = Math.random().toString(36).substr(2, 9);
        const newProject: Project = {
          id: newId,
          title: newTitle,
          sequences: [{ id: `seq-${Date.now()}`, title: '시퀀스 1' }],
          cuts: newCuts,
          characters: [{ id: 'c1', name: '홍길동', color: '#4f46e5' }, { id: 'c2', name: '성춘향', color: '#db2777' }],
          angles: [
            { id: 'a1', name: '하이앵글' },
            { id: 'a2', name: '로우앵글' },
            { id: 'a3', name: '아이레벨' },
            { id: 'a4', name: '더치앵글' },
            { id: 'a5', name: '버드아이뷰' },
            { id: 'a6', name: '웜즈아이뷰' },
            { id: 'a7', name: '오버더숄더' },
            { id: 'a8', name: '익스트림 롱샷' },
            { id: 'a9', name: '롱샷' },
            { id: 'a10', name: '풀샷' },
            { id: 'a11', name: '니샷' },
            { id: 'a12', name: '웨이스트샷' },
            { id: 'a13', name: '바스트샷' },
            { id: 'a14', name: '클로즈업' },
            { id: 'a15', name: '익스트림 클로즈업' }
          ],
          history: [],
          historyIndex: -1,
          focusedCutId: newCuts[0].id
        };

        // Save current state before adding new one
        setProjects(prev => {
          const updated = prev.map(p => {
            if (p.id === activeProjectId) {
              return {
                ...p,
                title,
                sequences,
                cuts,
                characters,
                angles,
                history,
                historyIndex,
                focusedCutId
              };
            }
            return p;
          });
          return [...updated, newProject];
        });

        // Switch to new project
        setIsInternalUpdate(true);
        setTitle(newProject.title);
        setSequences(newProject.sequences);
        setCuts(newProject.cuts);
        setCharacters(newProject.characters);
        setAngles(newProject.angles);
        setHistory(newProject.history);
        setHistoryIndex(newProject.historyIndex);
        setFocusedCutId(newProject.focusedCutId);
        setActiveProjectId(newId);
        setTimeout(() => setIsInternalUpdate(false), 0);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed inset-0 z-[50] flex flex-col items-center justify-center overflow-y-auto custom-scrollbar p-6",
              isDarkMode ? "bg-[#0f0f0f] text-white" : "bg-[#f8f9fa] text-gray-900"
            )}
          >
          <div className="max-w-4xl w-full space-y-16 py-20">
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest mb-4"
              >
                <Sparkles size={14} />
                <span>아이스 스크립툰(Ice Scriptoon) v1.0</span>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase break-keep"
              >
                창작의 흐름을 <br/>
                <span className="text-indigo-600">시각화</span> 하세요
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium break-keep"
              >
                귀찮고 힘든 글콘티, 간단하고 빠르게 작성해보세요!
              </motion.p>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-8"
              >
                <button 
                  onClick={handleStart}
                  className="group relative px-10 py-5 bg-indigo-600 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-4 mx-auto overflow-hidden"
                >
                  <span className="relative z-10">지금 시작하기</span>
                  <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { title: '실시간 시각화', desc: '텍스트 입력 즉시 컷 형태의 레이아웃으로 변환되어\n연출의 흐름을 한눈에 파악할 수 있습니다.', icon: <LayoutGrid size={24} /> },
                { title: '라이브러리 시스템', desc: '자주 쓰는 인물과 앵글을\n클릭 한 번으로 대사에 바로 삽입하세요.', icon: <Layers size={24} /> },
                { title: '간편한 저장', desc: 'PDF, HWP, TXT 등 다양한 포맷으로 내보내어\n출판사나 협업 작가와 즉시 공유할 수 있습니다.', icon: <Download size={24} /> }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-[#1e1e1e] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed break-keep whitespace-pre-line">{f.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Legal Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="pt-12 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-8">
                <button onClick={() => setShowAboutModal(true)} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">서비스 소개</button>
                <button onClick={() => setShowPrivacyModal(true)} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">개인정보처리방침</button>
                <button onClick={() => setShowTermsModal(true)} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">이용약관</button>
              </div>
              <div className="text-xs font-bold text-gray-300 dark:text-gray-700">
                Ice Scriptoon. All rights reserved.
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300",
            isDarkMode ? "bg-[#1a1a1a] text-[#e0e0e0]" : "bg-[#f5f5f5] text-[#333]"
          )}
        >
      {/* Tabs Bar */}
      <div className={cn(
        "flex-none border-b flex items-center px-4 gap-1 overflow-x-auto custom-scrollbar transition-colors",
        isDarkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-gray-100 border-gray-200"
      )}>
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => switchProject(project.id)}
            className={cn(
              "group relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer min-w-[120px] max-w-[200px] rounded-t-xl mt-1",
              activeProjectId === project.id 
                ? (isDarkMode ? "bg-[#242424] text-white" : "bg-white text-indigo-600 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]")
                : (isDarkMode ? "text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50")
            )}
          >
            <FileText size={14} className={activeProjectId === project.id ? "text-indigo-500" : "text-gray-400"} />
            <span className="truncate flex-1">{project.id === activeProjectId ? title : project.title}</span>
            <button 
              onClick={(e) => closeProject(e, project.id)}
              className={cn(
                "p-0.5 rounded-md transition-colors",
                activeProjectId === project.id ? "hover:bg-gray-100 dark:hover:bg-gray-700" : "opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-600"
              )}
            >
              <X size={12} />
            </button>
            {activeProjectId === project.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </div>
        ))}
        <button 
          onClick={addProject}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors ml-1"
          title="새 콘티 추가"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Header */}
      <header className={cn(
        "flex-none border-b px-6 py-3 flex items-center justify-between shadow-sm z-30 transition-colors",
        isDarkMode ? "bg-[#242424] border-gray-800" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <LayoutGrid size={20} />
          </div>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-64 break-keep"
          />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="찾기 및 바꾸기 (Ctrl+F)"
            >
              <Search size={18} />
            </button>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
              title="실행 취소 (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
              title="다시 실행 (Ctrl+Y)"
            >
              <Redo2 size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full mr-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">글자 크기</span>
            <button 
              onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold min-w-[24px] text-center">{fontSize}</span>
            <button 
              onClick={() => setFontSize(prev => Math.min(32, prev + 1))}
              className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <button 
            onClick={() => setShowAngleGuideModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="앵글 가이드"
          >
            <BookOpen size={18} />
            앵글 가이드
          </button>
          <button 
            onClick={() => setShowFAQModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="자주 묻는 질문"
          >
            <HelpCircle size={18} />
            FAQ
          </button>
          <button 
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="문의하기"
          >
            <Mail size={18} />
            문의
          </button>
          <button 
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
            title="튜토리얼 보기"
          >
            <HelpCircle size={18} />
            가이드
          </button>
          <button 
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="단축키 도움말 (Alt+H)"
          >
            <Settings2 size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title={isDarkMode ? '라이트 모드' : '다크 모드'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          <button 
            onClick={() => setShowAngleModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Camera size={16} />
            앵글
          </button>
          <button 
            onClick={() => setShowCharModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <UserPlus size={16} />
            인물
          </button>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? '복사됨' : '복사'}
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition-colors shadow-sm"
          >
            <Download size={16} />
            내보내기
          </button>
          <div className="relative">
            <input 
              type="file" 
              accept=".txt" 
              onChange={importText} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="텍스트 파일 불러오기"
            />
            <button 
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-full transition-colors"
            >
              <Upload size={16} />
              불러오기
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Vertical Ad Banner (Left) */}
        <div className={cn(
          "flex-none w-[160px] border-r flex flex-col items-center justify-center transition-colors overflow-hidden print:hidden",
          isDarkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"
        )}>
          <div className="relative w-[120px] h-[600px] bg-gray-50 dark:bg-[#242424] border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center group cursor-help" title="세로형 광고(Skyscraper): 사이드바 옆에 위치하여 시선 분산을 최소화하면서도 지속적인 노출이 가능합니다.">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ADVERTISEMENT</div>
            <div className="rotate-90 whitespace-nowrap">
              <p className="text-xs font-bold text-gray-400 group-hover:text-indigo-500 transition-colors">세로형 광고 배너 (120x600)</p>
            </div>
            <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-4 text-center px-2">애드센스 스카이스크래퍼<br/>광고 자리입니다.</p>
          </div>
        </div>

        {/* Left Panel: Navigator */}
        <aside 
          style={{ width: `${sidebarWidth}px` }}
          className={cn(
            "flex-none border-r flex flex-col overflow-hidden transition-colors",
            isDarkMode ? "bg-[#242424] border-gray-800" : "bg-white border-gray-200"
          )}
        >
          <div className={cn(
            "p-4 border-b flex items-center justify-between",
            isDarkMode ? "bg-[#2a2a2a] border-gray-800" : "bg-gray-50/50 border-gray-100"
          )}>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> 시퀀스 관리
            </h2>
            <button 
              onClick={addSequence}
              className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
              title="새 시퀀스 추가"
            >
              <FolderPlus size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {sequences.map((seq) => {
              const seqCuts = cuts.filter(c => c.sequenceId === seq.id);
              return (
                <div key={seq.id} className="space-y-2">
                  <div className="flex items-center justify-between group/seq">
                    <input 
                      type="text"
                      value={seq.title}
                      onChange={(e) => updateSequenceTitle(seq.id, e.target.value)}
                      style={{ fontSize: `${Math.max(10, fontSize * 0.8)}px` }}
                      className="font-black text-indigo-500 bg-transparent border-none focus:ring-0 w-full uppercase tracking-widest dark:text-indigo-400"
                    />
                    <button 
                      onClick={() => deleteSequence(seq.id)}
                      className="opacity-0 group-hover/seq:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 pl-1 border-l-2 border-gray-100 dark:border-gray-800 ml-1">
                    <Reorder.Group 
                      axis="y" 
                      values={seqCuts} 
                      onReorder={(newSeqCuts) => {
                        let i = 0;
                        const newCuts = cuts.map(c => {
                          if (c.sequenceId === seq.id) {
                            return newSeqCuts[i++];
                          }
                          return c;
                        });
                        setCuts(newCuts);
                      }}
                      className="space-y-2"
                    >
                      {seqCuts.map((cut) => {
                        const globalIndex = cuts.findIndex(c => c.id === cut.id);
                        return (
                          <Reorder.Item
                            key={cut.id}
                            value={cut}
                            onClick={() => scrollToCut(cut.id)}
                            className={cn(
                              "group relative p-3 rounded-xl border transition-all cursor-pointer",
                              focusedCutId === cut.id 
                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm" 
                                : "bg-white dark:bg-[#2a2a2a] border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-gray-50 dark:hover:bg-[#333]"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">#{globalIndex + 1}</span>
                                  <span 
                                    style={{ fontSize: `${Math.max(10, fontSize * 0.7)}px` }}
                                    className="font-bold text-gray-500 truncate"
                                  >
                                    {cut.angle || '앵글 미지정'}
                                  </span>
                                  <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 ml-auto">{cut.size}</span>
                                </div>
                                <div className="space-y-1">
                                  {cut.description && (
                                    <p 
                                      style={{ fontSize: `${Math.max(10, fontSize * 0.75)}px` }}
                                      className="text-gray-600 dark:text-gray-400 line-clamp-1 leading-tight break-keep"
                                    >
                                      {cut.description}
                                    </p>
                                  )}
                                  {cut.dialogue && (
                                    <div 
                                      style={{ fontSize: `${Math.max(10, fontSize * 0.8)}px` }}
                                      className="text-indigo-700 dark:text-indigo-400 font-medium line-clamp-2 leading-tight break-keep"
                                    >
                                      {renderDialogue(cut.dialogue, true)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                    <button 
                      onClick={() => addCut(undefined, seq.id)}
                      className="w-full py-2 border border-dashed border-gray-100 dark:border-gray-800 rounded-lg text-gray-300 dark:text-gray-700 hover:text-indigo-400 hover:border-indigo-100 transition-all text-[10px] font-bold"
                    >
                      + 컷 추가
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="text-[10px] font-bold text-gray-400 hover:text-indigo-500 transition-colors uppercase tracking-widest"
              >
                Privacy
              </button>
              <button 
                onClick={() => setShowTermsModal(true)}
                className="text-[10px] font-bold text-gray-400 hover:text-indigo-500 transition-colors uppercase tracking-widest"
              >
                Terms
              </button>
              <button 
                onClick={() => setShowContactModal(true)}
                className="text-[10px] font-bold text-gray-400 hover:text-indigo-500 transition-colors uppercase tracking-widest"
              >
                Contact
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-300 dark:text-gray-700">v1.0.0 Stable</span>
              <span className="text-[10px] font-bold text-gray-300 dark:text-gray-700">© 2026</span>
            </div>
          </div>
        </aside>

        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "w-1.5 cursor-col-resize hover:bg-indigo-500/50 transition-colors z-40 relative group",
            isResizing ? "bg-indigo-500" : "bg-transparent"
          )}
        >
          <div className={cn(
            "absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 dark:bg-gray-800 group-hover:bg-indigo-500 transition-colors",
            isResizing && "bg-indigo-500"
          )} />
        </div>

        {/* Right Panel: Editor */}
        <main className={cn(
          "flex-1 overflow-y-auto custom-scrollbar transition-colors",
          isDarkMode ? "bg-[#1a1a1a]" : "bg-[#f8f9fa]",
          isPrinting && "print-storyboard-grid"
        )}>
          <div className="max-w-3xl mx-auto py-12 px-8 pb-40 print:max-w-full print:py-0 print:px-0">
            {isPrinting && (
              <div className="hidden print:block mb-10 border-b-2 border-indigo-600 pb-4">
                <h1 className="text-3xl font-black uppercase tracking-tighter break-keep">{title}</h1>
                <p className="text-sm text-gray-500 mt-1">아이스 스크립툰(Ice Scriptoon) | {new Date().toLocaleDateString()}</p>
              </div>
            )}
            
            <Reorder.Group axis="y" values={cuts} onReorder={handleReorder} className="space-y-12">
              <AnimatePresence initial={false}>
                {cuts.map((cut, index) => (
                  <Reorder.Item
                    key={cut.id}
                    value={cut}
                    ref={el => editorRefs.current[cut.id] = el}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "bg-white dark:bg-[#242424] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 relative",
                      focusedCutId === cut.id ? "ring-4 ring-indigo-500/10 border-indigo-500 shadow-xl" : "opacity-80 grayscale-[0.5] scale-[0.98]",
                      "print:print-cut-card print:opacity-100 print:grayscale-0 print:scale-100 print:shadow-none print:border-gray-300"
                    )}
                    onFocus={() => setFocusedCutId(cut.id)}
                  >
                    {/* Print Only View */}
                    <div className="hidden print:flex print-cut-number">
                      <span className="text-xs uppercase tracking-widest text-gray-400 mb-1">CUT</span>
                      <span className="text-2xl font-black">{index + 1}</span>
                      <div className="mt-4 bg-gray-100 px-2 py-1 rounded text-[10px] font-black">{cut.size}</div>
                    </div>

                    {/* Standard View (Hidden during print if needed, or styled) */}
                    <div className="print:print-cut-content">
                      {/* Cut Header (Hidden in print) */}
                      <div className={cn(
                        "px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors rounded-t-[23px] print:hidden",
                        focusedCutId === cut.id 
                          ? (isDarkMode ? "bg-indigo-900/20" : "bg-indigo-50/50") 
                          : (isDarkMode ? "bg-[#2a2a2a]" : "bg-gray-50")
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 transition-colors">
                            <GripVertical size={16} />
                          </div>
                          <span className="bg-indigo-600 text-white font-black px-3 py-1 rounded-lg text-sm shadow-sm">
                            CUT {index + 1}
                          </span>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                          {(['XS', 'S', 'M', 'L', 'XL'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateCut(cut.id, 'size', s)}
                              className={cn(
                                "px-2 py-1 text-[10px] font-black rounded-lg transition-all",
                                cut.size === s 
                                  ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" 
                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={cut.sequenceId}
                          onChange={(e) => updateCut(cut.id, 'sequenceId', e.target.value)}
                          className="bg-transparent text-xs font-bold text-gray-400 border-none focus:ring-0 outline-none cursor-pointer hover:text-indigo-500 transition-colors"
                        >
                          {sequences.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <button 
                          onClick={() => deleteCut(cut.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cut Body */}
                    <div className="p-8 grid grid-cols-1 gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative">
                          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            <Camera size={14} className="text-indigo-400" /> 앵글
                          </label>

                          <AnimatePresence>
                            {focusedCutId === cut.id && isAngleFocused && (
                              <motion.div 
                                initial={{ opacity: 0, y: popupDirection === 'up' ? 10 : -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: popupDirection === 'up' ? 10 : -10, scale: 0.95 }}
                                className={cn(
                                  "absolute left-0 right-0 z-[100]",
                                  popupDirection === 'up' ? "bottom-full mb-3" : "top-full mt-3"
                                )}
                              >
                                <div className="bg-white dark:bg-[#2a2a2a] p-4 rounded-2xl border-2 border-indigo-500 dark:border-indigo-600 shadow-2xl overflow-hidden flex flex-col h-[280px]">
                                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    <div className="grid grid-cols-2 gap-2">
                                      {angles.map(angle => (
                                        <button
                                          key={angle.id}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            insertAngle(angle.name);
                                          }}
                                          className={cn(
                                            "px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 text-left border flex items-center justify-between group/btn",
                                            cut.angle === angle.name 
                                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                                              : "bg-gray-50 dark:bg-[#333] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:bg-white dark:hover:bg-[#3d3d3d] hover:text-indigo-700 dark:hover:text-indigo-400"
                                          )}
                                        >
                                          <span className="truncate">{angle.name}</span>
                                          {cut.angle === angle.name && <Check size={12} />}
                                        </button>
                                      ))}
                                    </div>
                                    {angles.length === 0 && (
                                      <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <AlertTriangle size={24} className="text-gray-300 mb-2" />
                                        <p className="text-xs text-gray-400 italic">등록된 앵글이 없습니다.<br/>상단 메뉴에서 추가해주세요.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <input 
                            type="text"
                            value={cut.angle}
                            data-cut-id={cut.id}
                            data-field="angle"
                            onChange={(e) => updateCut(cut.id, 'angle', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, cut.id, 'angle')}
                            onFocus={(e) => {
                              setFocusedCutId(cut.id);
                              setIsAngleFocused(true);
                              updatePopupDirection(e);
                            }}
                            onBlur={() => setIsAngleFocused(false)}
                            placeholder="클릭하여 앵글을 선택하거나 직접 입력하세요."
                            style={{ fontSize: `${fontSize}px` }}
                            className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-gray-200"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            <Volume2 size={14} className="text-indigo-400" /> 효과음 (SFX)
                          </label>
                          <input 
                            type="text"
                            value={cut.soundEffect}
                            data-cut-id={cut.id}
                            data-field="soundEffect"
                            onChange={(e) => updateCut(cut.id, 'soundEffect', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, cut.id, 'soundEffect')}
                            placeholder="예: 콰앙!, 슥삭..."
                            style={{ fontSize: `${fontSize}px` }}
                            className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono dark:text-gray-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          <FileText size={14} className="text-indigo-400" /> 상황 / 액션 / 묘사
                        </label>
                        <textarea 
                          value={cut.description}
                          data-cut-id={cut.id}
                          data-field="description"
                          onChange={(e) => updateCut(cut.id, 'description', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, cut.id, 'description')}
                          placeholder="인물의 행동이나 배경 상황을 묘사하세요."
                          rows={3}
                          style={{ fontSize: `${fontSize}px` }}
                          className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed dark:text-gray-200 break-keep"
                        />
                      </div>

                        <div className="relative">
                          <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            <MessageSquare size={14} className="text-indigo-400" /> 대사
                          </label>
                          
                          <AnimatePresence>
                            {focusedCutId === cut.id && isDialogueFocused && (
                              <motion.div 
                                initial={{ opacity: 0, y: popupDirection === 'up' ? 10 : -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: popupDirection === 'up' ? 10 : -10, scale: 0.95 }}
                                className={cn(
                                  "absolute left-0 right-0 z-[100]",
                                  popupDirection === 'up' ? "bottom-full mb-3" : "top-full mt-3"
                                )}
                              >
                                <div className="bg-white dark:bg-[#2a2a2a] p-4 rounded-2xl border-2 border-indigo-500 dark:border-indigo-600 shadow-2xl overflow-hidden flex flex-col h-[240px]">
                                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {characters.map(char => (
                                        <button
                                          key={char.id}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            insertCharacter(char.name);
                                          }}
                                          className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap text-left border border-transparent hover:border-indigo-400 flex items-center gap-2"
                                        >
                                          <div className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: char.color }} />
                                          <span className="truncate">{char.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                    {characters.length === 0 && (
                                      <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-[10px] text-gray-400 italic">등록된 인물이 없습니다.<br/>상단 메뉴에서 추가해주세요.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="relative">
                            <textarea 
                              value={cut.dialogue}
                              data-cut-id={cut.id}
                              data-field="dialogue"
                              onChange={(e) => updateCut(cut.id, 'dialogue', e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, cut.id, 'dialogue')}
                              onFocus={(e) => {
                                setFocusedCutId(cut.id);
                                setIsDialogueFocused(true);
                                updatePopupDirection(e);
                              }}
                              onBlur={() => setIsDialogueFocused(false)}
                              placeholder="대사를 입력하세요. 클릭 시 인물 선택창이 나타납니다."
                              rows={4}
                              style={{ fontSize: `${fontSize}px` }}
                              className={cn(
                                "w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed font-medium dark:text-gray-200",
                                focusedCutId === cut.id && isDialogueFocused ? "opacity-100" : "opacity-0 absolute inset-0 z-0 pointer-events-none"
                              )}
                            />
                            
                            {!(focusedCutId === cut.id && isDialogueFocused) && (
                              <div 
                                onClick={(e) => {
                                  const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                                  textarea.focus();
                                }}
                                style={{ fontSize: `${fontSize}px`, minHeight: '120px' }}
                                className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 leading-relaxed font-medium dark:text-gray-200 cursor-text overflow-hidden break-keep"
                              >
                                {cut.dialogue ? renderDialogue(cut.dialogue) : <span className="text-gray-400 italic">대사를 입력하세요...</span>}
                              </div>
                            )}
                          </div>
                        </div>
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            <div className="p-8 bg-gray-50 dark:bg-[#242424] rounded-[40px] border border-gray-100 dark:border-gray-800 text-center space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">창작에만 집중하세요</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                  본 서비스는 별도의 회원가입 없이 브라우저에서 즉시 사용할 수 있습니다. 
                  모든 데이터는 서버에 저장되지 않으며, 사용자의 기기에만 안전하게 보관됩니다.
                </p>
                <div className="pt-4 flex items-center justify-center gap-6">
                  <button onClick={() => setShowAboutModal(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">서비스 소개</button>
                  <button onClick={() => setShowPrivacyModal(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">개인정보 처리방침</button>
                  <button onClick={() => setShowTermsModal(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">이용약관</button>
                  <button onClick={() => setShowContactModal(true)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">문의하기</button>
                </div>
              </div>
          </div>
        </main>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Modals and Overlays */}
  <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTutorial(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <motion.div
                  key={tutorialStep}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"
                >
                  {tutorialSteps[tutorialStep].icon}
                </motion.div>
                
                <div className="space-y-3">
                  <motion.h2 
                    key={`title-${tutorialStep}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold tracking-tight"
                  >
                    {tutorialSteps[tutorialStep].title}
                  </motion.h2>
                  <motion.p 
                    key={`desc-${tutorialStep}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 dark:text-gray-400 leading-relaxed"
                  >
                    {tutorialSteps[tutorialStep].description}
                  </motion.p>
                </div>

                <div className="flex items-center gap-2">
                  {tutorialSteps.map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === tutorialStep ? "w-8 bg-indigo-600" : "w-2 bg-gray-200 dark:bg-gray-700"
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between w-full pt-4">
                  <button 
                    onClick={prevTutorialStep}
                    disabled={tutorialStep === 0}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-medium transition-all",
                      tutorialStep === 0 
                        ? "opacity-0 pointer-events-none" 
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    이전
                  </button>
                  <button 
                    onClick={nextTutorialStep}
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    {tutorialStep === tutorialSteps.length - 1 ? "시작하기" : "다음"}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowTutorial(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                  <Mail size={40} />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight">문의하기</h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    에디터 사용 중 불편한 점이나 기능 제안, <br/>
                    광고 문의 등이 있으시면 아래 메일로 연락주세요!
                  </p>
                </div>

                <div className="w-full p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">summerice104@gmail.com</span>
                  </div>
                  <a 
                    href="mailto:summerice104@gmail.com"
                    className="p-3 bg-white dark:bg-[#333] text-gray-500 hover:text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>

                <div className="w-full text-left p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">개인정보 및 보안 안내</h4>
                  <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1 list-disc pl-4">
                    <li>모든 콘티 데이터는 서버가 아닌 <strong>사용자의 브라우저(LocalStorage)</strong>에만 저장됩니다.</li>
                    <li>따라서 서버 해킹으로 인한 데이터 유출 위험이 없으며 매우 안전합니다.</li>
                    <li>단, 브라우저 캐시를 삭제하면 데이터가 사라질 수 있으니 정기적으로 <strong>[내보내기]</strong> 기능을 통해 백업해 주세요.</li>
                  </ul>
                </div>

                <button 
                  onClick={() => setShowContactModal(false)}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  확인
                </button>
              </div>

              <button 
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ Modal */}
      <AnimatePresence>
        {showFAQModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFAQModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="text-indigo-500" /> 자주 묻는 질문 (FAQ)
                </h2>
                <button onClick={() => setShowFAQModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
                {[
                  {
                    q: "데이터가 정말 서버에 저장되지 않나요?",
                    a: "네, 아이스 스크립툰은 별도의 서버를 운영하지 않으며 모든 데이터는 사용자의 브라우저 로컬 스토리지(LocalStorage)에만 저장됩니다. 개인정보 유출 걱정 없이 안심하고 사용하세요."
                  },
                  {
                    q: "다른 기기에서 이어서 작업할 수 있나요?",
                    a: "서버 저장 방식이 아니므로, [내보내기] 기능을 통해 파일(.json)로 저장한 뒤 다른 기기에서 [불러오기]를 하시면 이어서 작업이 가능합니다."
                  },
                  {
                    q: "모바일에서도 사용 가능한가요?",
                    a: "네, 반응형 웹으로 제작되어 모바일 브라우저에서도 최적화된 환경으로 사용하실 수 있습니다. 태블릿이나 스마트폰에서도 언제 어디서든 아이디어를 기록해 보세요."
                  },
                  {
                    q: "HWP나 PDF로 내보내면 형식이 깨지나요?",
                    a: "최대한 표준 규격에 맞춰 내보내기를 지원하지만, 사용하는 폰트나 뷰어 설정에 따라 미세한 차이가 있을 수 있습니다. PDF 내보내기(인쇄) 기능을 가장 추천드립니다."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2 p-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-start gap-2">
                      <span className="flex-none w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-[10px]">Q</span>
                      {item.q}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-7">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => setShowFAQModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Angle Guide Modal */}
      <AnimatePresence>
        {showAngleGuideModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAngleGuideModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="text-indigo-500" /> 웹툰 연출 앵글 가이드
                </h2>
                <button onClick={() => setShowAngleGuideModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "하이 앵글 (High Angle)",
                      desc: "위에서 아래로 내려다보는 구도. 캐릭터가 작고 무력해 보이게 하거나, 전체적인 위치 관계를 설명할 때 유용합니다. (객관적 시선 전달)",
                      tag: "무력함, 객관성"
                    },
                    {
                      title: "로우 앵글 (Low Angle)",
                      desc: "아래에서 위로 올려다보는 구도. 캐릭터를 위엄 있고 강하게 보이게 하거나, 압도적인 분위기를 연출할 때 사용합니다.",
                      tag: "권위, 압도감"
                    },
                    {
                      title: "아이 레벨 (Eye Level)",
                      desc: "눈높이에서 바라보는 구도. 가장 자연스럽고 안정적인 느낌을 주며, 일상적인 대화 장면에 주로 쓰입니다.",
                      tag: "안정감, 일상"
                    },
                    {
                      title: "버드 아이 뷰 (Bird's Eye View)",
                      desc: "아주 높은 곳에서 수직으로 내려다보는 구도. 지형지물이나 대규모 전투 장면 등 광범위한 정보를 전달할 때 효과적입니다.",
                      tag: "광활함, 정보전달"
                    },
                    {
                      title: "웜즈 아이 뷰 (Worm's Eye View)",
                      desc: "아주 낮은 지면에서 위를 보는 구도. 극적인 긴장감이나 거대함을 강조할 때 사용합니다.",
                      tag: "극적 긴장, 거대함"
                    },
                    {
                      title: "더치 틸트 (Dutch Tilt)",
                      desc: "카메라를 옆으로 기울인 구도. 불안함, 혼란, 광기 등 비정상적인 심리 상태를 표현할 때 탁월합니다.",
                      tag: "불안, 혼란"
                    },
                    {
                      title: "오버 더 숄더 (Over the Shoulder)",
                      desc: "인물의 어깨 너머로 상대방을 비추는 구도. 두 인물 간의 거리감과 대화의 몰입감을 높여줍니다.",
                      tag: "대화, 몰입"
                    },
                    {
                      title: "클로즈업 (Close-up)",
                      desc: "인물의 얼굴이나 특정 부위를 크게 잡는 구도. 감정 표현을 극대화하거나 중요한 단서를 강조할 때 필수적입니다.",
                      tag: "감정강조, 디테일"
                    },
                    {
                      title: "익스트림 클로즈업 (Extreme Close-up)",
                      desc: "눈, 입술 등 아주 좁은 부위만 비추는 구도. 극도의 긴장감이나 미세한 감정 변화를 묘사할 때 사용합니다.",
                      tag: "긴장극대화"
                    },
                    {
                      title: "풀 샷 (Full Shot)",
                      desc: "인물의 전신과 배경이 모두 보이는 구도. 인물의 움직임이나 주변 환경과의 관계를 보여줄 때 적합합니다.",
                      tag: "상황설명, 전신"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{item.title}</h4>
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full font-bold uppercase">{item.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => setShowAngleGuideModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">개인정보 처리방침</h2>
                <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">1. 개인정보의 수집 및 이용 목적</h3>
                  <p>본 서비스는 사용자의 데이터를 서버에 저장하지 않으며, 브라우저의 로컬 스토리지(LocalStorage)만을 사용합니다. 따라서 어떠한 개인정보도 수집하거나 외부로 전송하지 않습니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">2. 수집하는 개인정보 항목</h3>
                  <p>수집하는 개인정보가 없습니다. 사용자가 작성한 콘티 데이터는 사용자의 기기에만 머무릅니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">3. 개인정보의 보유 및 이용 기간</h3>
                  <p>데이터는 사용자가 브라우저 캐시를 삭제하거나 직접 초기화하기 전까지 사용자의 기기에 보관됩니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">4. 제3자 제공 및 광고 서비스</h3>
                  <p>본 서비스는 구글 애드센스(Google AdSense)를 통해 광고를 게재할 수 있습니다. 구글은 사용자가 본 웹사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 광고를 게재하기 위해 쿠키를 사용합니다.</p>
                  <p>사용자는 구글의 <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">광고 설정</a>을 방문하여 맞춤형 광고를 거부할 수 있습니다.</p>
                </section>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAboutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">서비스 소개 및 가이드</h2>
                <button onClick={() => setShowAboutModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-8">
                <section className="space-y-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-lg font-bold">창작의 시작을 더 쉽고 빠르게</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    웹툰 작가님들에게 '글 콘티'는 작품의 뼈대를 잡는 가장 중요한 단계입니다. 
                    하지만 일반적인 메모장이나 워드 프로세서는 컷의 시각적인 흐름을 파악하기 어렵습니다. 
                    본 에디터는 이러한 불편함을 해결하기 위해 탄생했습니다.
                  </p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-2">실시간 시각화</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">텍스트로 입력한 대사와 상황이 즉시 컷 형태로 시각화됩니다.</p>
                  </div>
                  <div className="p-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-2">인물 & 앵글 관리</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">자주 사용하는 인물과 앵글을 라이브러리로 관리하여 일관성을 유지합니다.</p>
                  </div>
                  <div className="p-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-2">간편한 저장</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, 텍스트, HWP 등 다양한 포맷으로 내보내어 협업에 활용할 수 있습니다.</p>
                  </div>
                  <div className="p-5 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold mb-2">보안 및 개인정보</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">모든 데이터는 서버가 아닌 브라우저에만 저장되어 안전합니다.</p>
                  </div>
                </div>

                <section className="p-6 bg-indigo-600 text-white rounded-3xl">
                  <h3 className="text-base font-bold mb-2">작가님들의 창작을 응원합니다!</h3>
                  <p className="text-xs opacity-90 leading-relaxed">
                    본 도구는 무료로 제공되며, 작가님들의 소중한 피드백을 통해 계속해서 발전해 나갈 예정입니다. 
                    사용 중 불편한 점이나 필요한 기능이 있다면 언제든 문의해 주세요.
                  </p>
                </section>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => setShowAboutModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTermsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden",
                isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">서비스 이용약관</h2>
                <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">1. 목적</h3>
                  <p>본 약관은 '아이스 스크립툰(Ice Scriptoon)' 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">2. 서비스의 제공 및 변경</h3>
                  <p>본 서비스는 웹툰 작가들의 창작 활동을 돕기 위해 무료로 제공되는 도구입니다. 서비스의 내용은 개발자의 사정에 따라 변경되거나 중단될 수 있습니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">3. 데이터의 관리</h3>
                  <p>사용자가 작성한 모든 데이터는 사용자의 브라우저에 저장됩니다. 개발자는 사용자의 데이터를 백업하거나 복구할 의무가 없으며, 기기 변경이나 브라우저 초기화로 인한 데이터 손실에 대해 책임을 지지 않습니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">4. 책임의 한계</h3>
                  <p>본 서비스는 "있는 그대로" 제공되며, 서비스 사용으로 인해 발생하는 어떠한 직접적, 간접적 손해에 대해서도 개발자는 책임을 지지 않습니다.</p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">5. 면책 조항</h3>
                  <p>사용자가 작성한 콘텐츠의 저작권은 사용자 본인에게 있으며, 서비스 이용 중 발생한 데이터 손실이나 오류에 대해 개발자는 기술적 지원을 보장하지 않습니다.</p>
                </section>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#242424] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">내보내기</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <button 
                  onClick={handlePrint}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group"
                >
                  <div className="w-12 h-12 bg-white dark:bg-[#333] rounded-xl flex items-center justify-center shadow-sm group-hover:text-indigo-500 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold dark:text-white">PDF로 저장 (인쇄)</div>
                    <div className="text-xs text-gray-400">브라우저 인쇄 기능을 사용하여 PDF로 저장합니다.</div>
                  </div>
                </button>

                <button 
                  onClick={exportToTxt}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group"
                >
                  <div className="w-12 h-12 bg-white dark:bg-[#333] rounded-xl flex items-center justify-center shadow-sm group-hover:text-indigo-500 transition-colors">
                    <Type size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold dark:text-white">텍스트 파일 (.txt)</div>
                    <div className="text-xs text-gray-400">메모장 등에서 열 수 있는 일반 텍스트 파일입니다.</div>
                  </div>
                </button>

                <button 
                  onClick={() => exportToDoc('hwp')}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group"
                >
                  <div className="w-12 h-12 bg-white dark:bg-[#333] rounded-xl flex items-center justify-center shadow-sm group-hover:text-indigo-500 transition-colors">
                    <FileDown size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold dark:text-white">한글/워드 호환 (.hwp)</div>
                    <div className="text-xs text-gray-400">한글(HWP)이나 워드에서 열 수 있는 문서 파일입니다.</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search & Replace Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearchModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#242424] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">찾기 및 바꾸기</h2>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">찾을 내용</label>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-gray-200"
                      placeholder="검색할 텍스트..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">바꿀 내용</label>
                    <input 
                      type="text" 
                      value={replaceQuery}
                      onChange={(e) => setReplaceQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-gray-200"
                      placeholder="대체할 텍스트..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">검색 범위</label>
                    <div className="flex gap-2">
                      {(['all', 'dialogue', 'description'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSearchTarget(t)}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all",
                            searchTarget === t 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-gray-50 dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-800 text-gray-500"
                          )}
                        >
                          {t === 'all' ? '전체' : t === 'dialogue' ? '대사' : '상황'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSearchReplace}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Replace size={18} />
                  모두 바꾸기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcutsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcutsModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#242424] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">설정 및 도움말</h2>
                <button onClick={() => setShowShortcutsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                  <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">웹툰 스토리보드 에디터란?</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    본 에디터는 웹툰 작가님들이 글 콘티 단계에서 시각적인 흐름을 더 직관적으로 파악할 수 있도록 돕는 전문 도구입니다. 
                    텍스트 기반의 편집과 동시에 컷의 크기, 앵글, 인물을 시각적으로 관리하여 더욱 효율적인 창작 환경을 제공합니다.
                  </p>
                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="mt-3 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    자세히 알아보기 →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest">편집 및 이동</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-gray-500">이동</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">방향키</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">컷 추가</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Ctrl + Enter</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">컷 삭제</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Ctrl + Backspace</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">실행 취소</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Ctrl + Z</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">다시 실행</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Ctrl + Y</kbd></li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest">설정 및 관리</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-gray-500">인물 관리</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Alt + C</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">앵글 관리</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Alt + A</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">다크 모드</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Alt + D</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">내보내기</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Ctrl + S</kbd></li>
                      <li className="flex justify-between"><span className="text-gray-500">도움말</span> <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Alt + H</kbd></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-800">
                  <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">컷 크기 변경 (Alt + 숫자)</h3>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map((s, i) => (
                      <div key={s} className="flex-1 text-center p-2 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border dark:border-gray-800">
                        <div className="text-[10px] font-bold text-gray-400 mb-1">{s}</div>
                        <kbd className="text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border dark:border-gray-700">Alt + {i+1}</kbd>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-800 space-y-4">
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">데이터 관리</h3>
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-sm font-bold text-red-600 dark:text-red-400">모든 데이터 초기화</div>
                      <div className="text-[11px] text-red-500/70">브라우저에 저장된 모든 콘티와 설정을 삭제합니다.</div>
                    </div>
                    <button 
                      onClick={() => {
                        if (window.confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all shadow-sm"
                    >
                      초기화
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-800 space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">법적 고지 및 약관</h3>
                  <div className="flex gap-4 mb-2">
                    <button 
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      개인정보 처리방침 보기
                    </button>
                    <button 
                      onClick={() => setShowTermsModal(true)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      서비스 이용약관 보기
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed space-y-2">
                    <p>• <strong>데이터 보안:</strong> 본 서비스는 사용자의 데이터를 서버에 저장하지 않으며, 브라우저의 로컬 스토리지만을 사용합니다.</p>
                    <p>• <strong>책임의 한계:</strong> 본 서비스 사용 중 발생하는 데이터 손실이나 오류에 대해 개발자는 책임을 지지 않습니다.</p>
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-800 flex items-center justify-between">
                  <div className="text-[10px] text-gray-400 font-medium">v1.0.0 Stable</div>
                  <div className="text-[10px] text-gray-400 font-medium">© 2026 아이스 스크립툰(Ice Scriptoon)</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close Confirmation Modal */}
      <AnimatePresence>
        {showCloseConfirmModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCloseConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#242424] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-bold dark:text-white mb-3">콘티를 닫으시겠습니까?</h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                  콘티를 닫으면 저장되지 않은 모든 내용이 사라집니다.<br />
                  정말 닫으시겠습니까?
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCloseConfirmModal(false)}
                    className="flex-1 px-6 py-3.5 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all"
                  >
                    취소
                  </button>
                  <button 
                    onClick={confirmCloseProject}
                    className="flex-1 px-6 py-3.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-lg shadow-red-500/20 transition-all"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Character Management Modal */}
      <AnimatePresence>
        {showCharModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCharModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#242424] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">인물 관리</h2>
                <button onClick={() => setShowCharModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCharName}
                      onChange={(e) => setNewCharName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCharacter()}
                      placeholder="인물 이름 입력"
                      className="flex-1 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-gray-200"
                    />
                    <button 
                      onClick={addCharacter}
                      className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    {presetColors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          if (selectedCharId) {
                            updateCharacterColor(selectedCharId, color);
                          }
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all border-2",
                          selectedColor === color ? "border-indigo-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="relative">
                      <input 
                        type="color" 
                        id="customColor"
                        className="sr-only"
                        value={selectedColor}
                        onChange={(e) => {
                          const color = e.target.value;
                          setSelectedColor(color);
                          if (selectedCharId) {
                            updateCharacterColor(selectedCharId, color);
                          }
                        }}
                      />
                      <label 
                        htmlFor="customColor"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        title="커스텀 색상 선택"
                      >
                        <Palette size={16} className="text-gray-500" />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {characters.map(char => (
                    <div 
                      key={char.id} 
                      onClick={() => {
                        setSelectedCharId(char.id);
                        setSelectedColor(char.color || '#4f46e5');
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl group cursor-pointer transition-all",
                        selectedCharId === char.id 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20" 
                          : "bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#333]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: char.color || '#4f46e5' }} 
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{char.name}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCharacter(char.id);
                          if (selectedCharId === char.id) setSelectedCharId(null);
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {characters.length === 0 && (
                    <div className="text-center py-8 text-gray-400 italic">
                      등록된 인물이 없습니다.
                    </div>
                  )}
                </div>

                {/* Library Management */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">라이브러리</h3>
                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[8px] font-black rounded-sm uppercase tracking-tighter">Auto-Sync</span>
                    </div>
                    {libraryFeedback?.type === 'characters' && (
                      <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
                      >
                        {libraryFeedback.message}
                      </motion.span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => saveToLibrary('characters')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold"
                      title="현재 인물 목록을 브라우저에 저장"
                    >
                      <Download size={14} />
                      저장
                    </button>
                    <button 
                      onClick={() => loadFromLibrary('characters')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold"
                      title="브라우저에 저장된 인물 목록 불러오기"
                    >
                      <Upload size={14} />
                      불러오기
                    </button>
                    <button 
                      onClick={() => exportLibrary('characters')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold"
                      title="인물 목록을 JSON 파일로 내보내기"
                    >
                      <FileDown size={14} />
                      내보내기
                    </button>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold cursor-pointer" title="JSON 파일에서 인물 목록 가져오기">
                      <FileText size={14} />
                      가져오기
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => importLibrary('characters', e)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-8 py-6 bg-gray-50 dark:bg-[#2a2a2a] text-right">
                <button 
                  onClick={() => setShowCharModal(false)}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Angle Management Modal */}
      <AnimatePresence>
        {showAngleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAngleModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#242424] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">앵글 관리</h2>
                <button onClick={() => setShowAngleModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newAngleName}
                    onChange={(e) => setNewAngleName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAngle()}
                    placeholder="앵글 이름 입력"
                    className="flex-1 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 focus:bg-white dark:focus:bg-[#333] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-gray-200"
                  />
                  <button 
                    onClick={addAngle}
                    className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={24} />
                  </button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {angles.map(angle => (
                    <div key={angle.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-xl group">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{angle.name}</span>
                      <button 
                        onClick={() => removeAngle(angle.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {angles.length === 0 && (
                    <div className="text-center py-8 text-gray-400 italic">
                      등록된 앵글이 없습니다.
                    </div>
                  )}
                </div>

                {/* Library Management */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">라이브러리</h3>
                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[8px] font-black rounded-sm uppercase tracking-tighter">Auto-Sync</span>
                    </div>
                    {libraryFeedback?.type === 'angles' && (
                      <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
                      >
                        {libraryFeedback.message}
                      </motion.span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => saveToLibrary('angles')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold"
                      title="현재 앵글 목록을 브라우저에 저장"
                    >
                      <Download size={14} />
                      저장
                    </button>
                    <button 
                      onClick={() => loadFromLibrary('angles')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold"
                      title="브라우저에 저장된 앵글 목록 불러오기"
                    >
                      <Upload size={14} />
                      불러오기
                    </button>
                    <button 
                      onClick={() => exportLibrary('angles')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold"
                      title="앵글 목록을 JSON 파일로 내보내기"
                    >
                      <FileDown size={14} />
                      내보내기
                    </button>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold cursor-pointer" title="JSON 파일에서 앵글 목록 가져오기">
                      <FileText size={14} />
                      가져오기
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => importLibrary('angles', e)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-8 py-6 bg-gray-50 dark:bg-[#2a2a2a] text-right">
                <button 
                  onClick={() => setShowAngleModal(false)}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Status */}
      <footer className={cn(
        "fixed bottom-0 left-0 right-0 border-t px-6 py-3 flex items-center justify-between text-xs font-medium transition-colors",
        isDarkMode ? "bg-[#242424]/80 backdrop-blur-md border-gray-800 text-gray-500" : "bg-white/80 backdrop-blur-md border-gray-200 text-gray-400"
      )}>
        <div className="flex items-center gap-4">
          <span>총 {cuts.length}컷</span>
          <span>시퀀스 {sequences.length}개</span>
          <span>인물 {characters.length}명</span>
          <span>앵글 {angles.length}개</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          자동 저장됨
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#444' : '#e5e7eb'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#555' : '#d1d5db'};
        }
      `}</style>
    </>
  );
}
