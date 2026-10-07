'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  GripVertical,
  Plus,
  Filter,
  Users,
  Gift,
  Zap,
  Globe,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface Task {
  id: number;
  title: string;
  completed: number;
  priority: number;
  position: number;
  created_at: string;
}

type FilterType = 'all' | 'pending' | 'completed';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const editInputRef = useRef<HTMLInputElement>(null);

  const testimonials = [
    {
      quote: 'Deje de usar apps complicadas. QA Flow 2026 hace exactamente lo que necesito.',
      author: 'Maria Rodriguez',
      role: 'Disenadora Freelance',
    },
    {
      quote: 'Mis estudiantes la usan para proyectos. Gratis y sin publicidades invasoras.',
      author: 'Dr. Carlos Mendez',
      role: 'Profesor Universidad',
    },
    {
      quote: 'La sincronizacion entre mis dispositivos es impecable. Muy recomendado.',
      author: 'Sofia Garcia',
      role: 'Emprendedora',
    },
  ];

  useEffect(() => {
    fetchTasks();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch {
      console.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      const data = await res.json();
      setTasks(data);
      setNewTaskTitle('');
    } catch {
      console.error('Error adding task');
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      setTasks(tasks.map(t => (t.id === task.id ? { ...t, completed: t.completed ? 0 : 1 } : t)));
    } catch {
      console.error('Error updating task');
    }
  };

  const togglePriority = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: !task.priority }),
      });
      setTasks(tasks.map(t => (t.id === task.id ? { ...t, priority: t.priority ? 0 : 1 } : t)));
    } catch {
      console.error('Error updating priority');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch {
      console.error('Error deleting task');
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || editingId === null) return;
    try {
      await fetch(`/api/tasks/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      setTasks(tasks.map(t => (t.id === editingId ? { ...t, title: editTitle.trim() } : t)));
      setEditingId(null);
      setEditTitle('');
    } catch {
      console.error('Error updating task');
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;
  };

  const handleDrop = async (targetTask: Task) => {
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const newTasks = [...tasks];
    const draggedIndex = newTasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = newTasks.findIndex(t => t.id === targetTask.id);

    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    const reorderedTasks = newTasks.map((t, i) => ({ ...t, position: i }));
    setTasks(reorderedTasks);
    setDraggedTask(null);

    try {
      await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds: reorderedTasks.map(t => t.id) }),
      });
    } catch {
      console.error('Error reordering tasks');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CONSTRUCTOR_API}/v1/forms/${process.env.NEXT_PUBLIC_PROJECT_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactForm),
        }
      );
      if (res.ok) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority).length,
  };

  const navLinks = [
    { href: '#app', label: 'Aplicacion' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#caracteristicas', label: 'Caracteristicas' },
    { href: '#precio', label: 'Precio' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <ListTodo className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
              <span className="text-xl font-bold">QA Flow 2026</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                aria-label="Cambiar tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          <div
            className={`md:hidden absolute left-0 right-0 px-4 pb-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileNavOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2 text-sm font-medium transition-all duration-300"
                  style={{
                    color: 'var(--text-secondary)',
                    transitionDelay: mobileNavOpen ? `${index * 60}ms` : '0ms',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="py-2 flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Modo claro' : 'Modo oscuro'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Split Section */}
      <section
        className="py-16 md:py-24"
        style={{
          background: `linear-gradient(to bottom right, var(--bg-secondary), var(--bg-primary))`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text + CTA */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Organiza tus tareas con claridad
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Una herramienta simple y gratuita que guarda todo automaticamente
              </p>
              <a
                href="#app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-transform hover:scale-105"
                style={{ backgroundColor: 'var(--accent-blue)' }}
              >
                Comenzar ahora
              </a>
            </div>

            {/* Right: Task App Preview */}
            <div
              className="rounded-2xl p-6 shadow-xl border"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-3">
                {[
                  { title: 'Revisar documentacion del proyecto', completed: true, priority: false },
                  { title: 'Preparar presentacion para el cliente', completed: false, priority: true },
                  { title: 'Actualizar dependencias del sistema', completed: false, priority: false },
                  { title: 'Reunirse con equipo de diseno', completed: true, priority: false },
                  { title: 'Implementar nuevas funcionalidades', completed: false, priority: true },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      opacity: task.completed ? 0.6 : 1,
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                    )}
                    {task.priority && !task.completed && (
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                    <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-8 border-y" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Users, value: '150,000+', label: 'usuarios activos' },
              { icon: CheckCircle2, value: '2.3M', label: 'tareas completadas' },
              { icon: Gift, value: '100%', label: 'gratuito' },
              { icon: Zap, value: '0 seg', label: 'latencia en guardado' },
              { icon: Globe, value: 'Todos', label: 'los navegadores' },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                <stat.icon className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
                <div>
                  <div className="font-bold">{stat.value}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main App Section */}
      <section id="app" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Tu lista de tareas</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Agrega, organiza y completa tus tareas
            </p>
          </div>

          {/* Add Task */}
          <Card className="mb-6" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Escribe una nueva tarea y presiona Enter..."
                  className="flex-1"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                />
                <Button
                  onClick={addTask}
                  style={{ backgroundColor: 'var(--accent-blue)' }}
                  className="text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Agregar</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <div className="flex gap-1">
                {(['all', 'pending', 'completed'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === f ? 'text-white' : ''
                    }`}
                    style={{
                      backgroundColor: filter === f ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                      color: filter === f ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Total: {stats.total}</span>
              <span>Pendientes: {stats.pending}</span>
              <span>Completadas: {stats.completed}</span>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                Cargando tareas...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                {filter === 'all'
                  ? 'No hay tareas. Agrega una nueva tarea para comenzar.'
                  : filter === 'pending'
                  ? 'No hay tareas pendientes.'
                  : 'No hay tareas completadas.'}
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragOver={e => handleDragOver(e, task)}
                  onDrop={() => handleDrop(task)}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    draggedTask?.id === task.id ? 'dragging' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <GripVertical
                    className="w-4 h-4 drag-handle flex-shrink-0"
                    style={{ color: 'var(--text-secondary)' }}
                  />

                  <button onClick={() => toggleComplete(task)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <Circle className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </button>

                  <button
                    onClick={() => togglePriority(task)}
                    className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                      task.priority ? 'bg-red-500 border-red-500' : ''
                    }`}
                    style={{ borderColor: task.priority ? undefined : 'var(--border-color)' }}
                    title={task.priority ? 'Quitar prioridad alta' : 'Marcar como prioridad alta'}
                  />

                  {editingId === task.id ? (
                    <Input
                      ref={editInputRef}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditTitle('');
                        }
                      }}
                      onBlur={saveEdit}
                      className="flex-1"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                    />
                  ) : (
                    <span
                      className={`flex-1 ${task.completed ? 'task-completed' : ''}`}
                      onDoubleClick={() => startEdit(task)}
                    >
                      {task.title}
                    </span>
                  )}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 rounded hover:opacity-70 transition-opacity"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded hover:opacity-70 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Como Funciona (Process Steps) */}
      <section id="como-funciona" className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Pencil,
                title: 'Agrega tareas en segundos',
                description: 'Escribe el nombre, presiona Enter, listo',
              },
              {
                icon: CheckCircle2,
                title: 'Marca como completadas',
                description: 'Un clic para tachar, o arrastra para reorganizar',
              },
              {
                icon: Filter,
                title: 'Filtra por estado',
                description: 'Ve pendientes, completadas, o todas en un instante',
              },
            ].map((step, i) => (
              <Card
                key={i}
                className="text-center p-6"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <step.icon className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Caracteristicas (Features Bento) */}
      <section id="caracteristicas" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Caracteristicas principales</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: 'Persistencia automatica',
                description: 'Tus tareas nunca se pierden',
              },
              {
                icon: Users,
                title: 'Sin registrarse',
                description: 'Comienza sin crear cuenta',
              },
              {
                icon: Moon,
                title: 'Temas claro y oscuro',
                description: 'Elige lo que prefieras',
              },
              {
                icon: Globe,
                title: 'Sincronizacion instantanea',
                description: 'Multiples pestanas actualizadas en tiempo real',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-6 flex items-start gap-4"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Por que elegir (About Centered) */}
      <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Por que elegir QA Flow 2026</h2>
          <div className="space-y-6 text-left">
            {[
              {
                title: 'Diseno minimalista',
                description: 'Interfaz limpia sin botones innecesarios',
              },
              {
                title: 'Tu privacidad importa',
                description: 'Todo se guarda en la base de datos, nunca compartimos tu informacion',
              },
              {
                title: 'Velocidad garantizada',
                description: 'Carga en menos de 500ms',
              },
              {
                title: 'Hecho para espanol',
                description: 'Completamente traducido, sin anglicismos',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros usuarios</h2>
          <div className="relative">
            <Card
              className="p-8 text-center"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
            >
              <p className="text-xl mb-6 italic">&quot;{testimonials[testimonialIndex].quote}&quot;</p>
              <p className="font-semibold">{testimonials[testimonialIndex].author}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{testimonials[testimonialIndex].role}</p>
            </Card>
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setTestimonialIndex((testimonialIndex - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                aria-label="Anterior testimonio"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === testimonialIndex ? 'var(--accent-blue)' : 'var(--border-color)',
                    }}
                    aria-label={`Testimonio ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setTestimonialIndex((testimonialIndex + 1) % testimonials.length)}
                className="p-2 rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                aria-label="Siguiente testimonio"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precio" className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Precio</h2>
          <Card className="p-8" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-2xl font-bold mb-2">Plan Gratuito</h3>
            <div className="text-5xl font-bold mb-6" style={{ color: 'var(--accent-blue)' }}>
              $0<span className="text-lg font-normal" style={{ color: 'var(--text-secondary)' }}>/mes</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                'Tareas ilimitadas',
                'Almacenamiento permanente',
                'Sin anuncios ni limites de tiempo',
                'Acceso desde cualquier dispositivo',
                'Actualizaciones continuas gratis',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="#app"
              className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg text-white font-semibold transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--accent-blue)' }}
            >
              Comenzar gratis
            </a>
            <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Siempre gratis. Sin tarjeta de credito requerida.
            </p>
          </Card>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contacto" className="py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Contacto</h2>
          {formStatus === 'success' ? (
            <Card className="p-8 text-center" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent-green)' }} />
              <p className="text-xl font-semibold">Mensaje enviado</p>
              <p style={{ color: 'var(--text-secondary)' }}>Te contactaremos pronto</p>
            </Card>
          ) : (
            <Card className="p-6" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <Input
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mensaje</label>
                  <textarea
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={4}
                    className="flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
                {formStatus === 'error' && (
                  <p className="text-red-500 text-sm">Error al enviar el mensaje. Intenta de nuevo.</p>
                )}
                <Button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="w-full text-white"
                  style={{ backgroundColor: 'var(--accent-blue)' }}
                >
                  {formStatus === 'loading' ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <ListTodo className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
                <span className="text-xl font-bold">QA Flow 2026</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                Una herramienta simple y gratuita para gestionar tus tareas sin distracciones.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navegacion</h4>
              <ul className="space-y-2">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <a
                href="#contacto"
                className="hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Enviar mensaje
              </a>
            </div>
          </div>
          <div
            className="mt-8 pt-8 border-t text-center text-sm"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            2026 QA Flow 2026. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
