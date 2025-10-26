import React from 'react';

export type Movement = { id: string; name?: string; amount?: number; time: string; date?: string };
export type Project = { id: string; title: string; role?: string; donated: number; goal: number; recentMovements?: Movement[]; image?: any };

let projects: Project[] = [
  { id: 'p1', title: 'Mejorar alumbrado público', role: 'Colaborador', donated: 12400, goal: 20000, recentMovements: [
    { id: 'm1', name: 'María López', amount: 150, time: '2h', date: '2025-10-24' },
    { id: 'm2', name: 'Carlos Ruiz', amount: 500, time: '1d', date: '2025-10-23' },
  ], image: require('@/assets/images/Banorte-TDC-Basica-.avif') },
  { id: 'p2', title: 'Parque comunitario', role: 'Organizador', donated: 5600, goal: 20000, recentMovements: [
    { id: 'm3', name: 'Ana Gómez', amount: 200, time: '3h', date: '2025-10-24' },
  ], image: require('@/assets/images/Banorte-TDC-Clasica.avif') },
  { id: 'p3', title: 'Huertos urbanos', role: 'Colaborador', donated: 8000, goal: 10000, recentMovements: [
    { id: 'm4', name: 'Luis Pérez', amount: 1200, time: '5d', date: '2025-10-20' },
  ], image: require('@/assets/images/Banorte-TDC-Oro.avif') },
];

const listeners = new Set<() => void>();

export function subscribeProjects(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProjectsSnapshot() {
  return projects.slice();
}

export function addProject(p: Project) {
  projects = [p, ...projects];
  listeners.forEach(l => l());
}

export function useProjects(): [Project[], (p: Project) => void] {
  const [state, setState] = React.useState<Project[]>(() => projects.slice());
  React.useEffect(() => {
    const unsub = subscribeProjects(() => setState(projects.slice()));
    return () => { unsub(); };
  }, []);
  return [state, addProject];
}
