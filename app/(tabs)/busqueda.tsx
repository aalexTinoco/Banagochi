import { Project, useProjects } from '@/app/state/projects-store';
import { useUser } from '@/app/state/user-store';
import CreateProjectModal from '@/components/create-project-modal';
import Header from '@/components/header';
import SearchBar from '@/components/search-bar';
import { GRAY, RED, WHITE } from '@/css/globalcss';
import { API, ProjectsService } from '@/services/api';
import type { Project as APIProject } from '@/services/types/projects.types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

function formatDateLabel(d?: string) {
  if (!d) return '';
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(d);
  if (!isoMatch) return d;
  const [, year, mm, dd] = isoMatch;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const month = months[Number(mm) - 1] || mm;
  return `${Number(dd)} de ${month} ${year}`;
}export default function BusquedaScreen() {
  const router = useRouter();
  const user = useUser();

  const [query, setQuery] = useState('');
  const [projects, addProject] = useProjects();
  const [apiProjects, setApiProjects] = useState<APIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [coloniaFilter, setColoniaFilter] = useState<string>('ALL');

  // Fetch projects from API on mount
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching projects from API...');
      const data = await ProjectsService.getAll();
      console.log('✅ Projects loaded:', data.length);
      
      setApiProjects(data);
    } catch (err: any) {
      console.error('❌ Error loading projects:', err);
      setError('No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  }

  // Get unique colonias for filter
  const colonias = useMemo(() => {
    const unique = new Set(apiProjects.map(p => p.colonia));
    return ['ALL', ...Array.from(unique)];
  }, [apiProjects]);

  // Filter projects based on search query and filters
  const filtered = useMemo(() => {
    let result = apiProjects.filter(p => p.active);

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Apply colonia filter
    if (coloniaFilter !== 'ALL') {
      result = result.filter(p => p.colonia === coloniaFilter);
    }

    // Apply search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.colonia.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort: prioritize user's colony first, then by creation date
    // Note: We'd need user's colony from context/state to implement this
    return result.sort((a, b) => {
      // For now, just sort by creation date
      return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
    });
  }, [query, apiProjects, statusFilter, coloniaFilter]);

  const [suggModalVisible, setSuggModalVisible] = useState(false);
  const [selected, setSelected] = useState<APIProject | null>(null);
  const [createVisible, setCreateVisible] = useState(false);

  const openSuggestions = (p: APIProject) => {
    setSelected(p);
    setSuggModalVisible(true);
  };

  const startCreateFor = (p?: APIProject) => {
    // Open create modal (optionally with project context)
    setSuggModalVisible(false);
    setCreateVisible(true);
  };

  // Función para apoyar un proyecto (votar + crear tarjeta)
  const handleSupportProject = async (project: APIProject) => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para apoyar un proyecto');
      return;
    }

    // Verificar si el usuario ya votó
    if (project.votingStats?.voters?.includes(user.id)) {
      Alert.alert('Info', 'Ya has apoyado este proyecto');
      return;
    }

    try {
      // Agregar voto al proyecto
      await API.projects.addVote(project._id, { userId: user.id });

      // Crear tarjeta automáticamente al apoyar el proyecto
      try {
        // Generar número de tarjeta único basado en timestamp y userId
        const timestamp = Date.now().toString().slice(-8);
        const userIdPart = user.id.slice(-4);
        const cardNumber = `4152${timestamp}${userIdPart}`;
        
        // Determinar tipo de tarjeta basado en el monto del proyecto
        const fundingGoal = project.fundingGoal || 0;
        let cardType: 'banortemujer' | 'banorteclasica' | 'banorteoro';
        let maxCredit: number;
        
        if (fundingGoal < 5000) {
          cardType = 'banortemujer';
          maxCredit = 5000;
        } else if (fundingGoal < 20000) {
          cardType = 'banorteclasica';
          maxCredit = 20000;
        } else {
          cardType = 'banorteoro';
          maxCredit = 50000;
        }
        
        // Calcular fecha de expiración (3 años desde ahora) en formato YYYY-MM
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 3);
        const year = expiryDate.getFullYear();
        const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
        const expiry = `${year}-${month}`;
        
        console.log('📝 Creando tarjeta al apoyar:', { userId: user.id, cardNumber, cardType, maxCredit, expiry });
        
        // Crear la tarjeta vinculada al proyecto
        const cardResult = await API.cards.createCard({
          userId: user.id,
          cardNumber,
          holderName: user.name || 'Usuario',
          expiry,
          type: cardType,
          maxCredit,
          cutoffDay: 15,
        });
        
        console.log('✅ Tarjeta creada automáticamente al apoyar el proyecto:', cardResult);
      } catch (cardError: any) {
        console.error('⚠️ Error creando tarjeta automática:', cardError);
        console.error('⚠️ Detalle del error:', cardError?.response?.data || cardError?.message);
        // No bloqueamos el flujo si falla la creación de tarjeta
      }

      setSuggModalVisible(false);
      await loadProjects();
      Alert.alert('¡Éxito!', 'Has apoyado este proyecto exitosamente y se ha creado tu tarjeta');
    } catch (error: any) {
      console.error('Error supporting project:', error);
      Alert.alert('Error', 'No se pudo apoyar el proyecto. Intenta de nuevo.');
    }
  };

  // createProject handled by CreateProjectModal via onCreate

  // Build dynamic reasons/suggestions for a selected project
  const buildReasons = (p?: APIProject | null) => {
    if (!p) return [] as string[];
    const reasons: string[] = [];
    reasons.push(`Impacto local: "${p.title}" mejora la calidad de vida en ${p.colonia}.`);
    reasons.push(p.fundingGoal > 10000 ? 'Alto potencial de impacto si se alcanza la meta.' : 'Meta alcanzable con microdonaciones regulares.');
    reasons.push('Permite visibilidad para quienes quieran colaborar y voluntariados locales.');
    reasons.push('Crear este proyecto puede atraer patrocinadores y apoyo institucional.');
    return reasons;
  };

  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'VOTING': 'En votación',
      'FUNDING': 'Recaudando fondos',
      'IN_PROGRESS': 'En progreso',
      'COMPLETED': 'Completado',
      'REJECTED': 'Rechazado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={{ marginTop: 16, color: GRAY }}>Cargando proyectos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: RED, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Error</Text>
          <Text style={{ color: GRAY, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: RED }]} onPress={loadProjects}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />

      <View style={styles.searchArea}>
        <Text style={styles.title}>Buscar proyectos en tu comunidad</Text>
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar por título o categoría" />
        
        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Estado:</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {
                    // Ciclar entre estados
                    const states = ['ALL', 'VOTING', 'FUNDING', 'IN_PROGRESS', 'COMPLETED'];
                    const currentIndex = states.indexOf(statusFilter);
                    const nextIndex = (currentIndex + 1) % states.length;
                    setStatusFilter(states[nextIndex]);
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {statusFilter === 'ALL' ? 'Todos' : 
                     statusFilter === 'VOTING' ? 'Votación' :
                     statusFilter === 'FUNDING' ? 'Recaudando' :
                     statusFilter === 'IN_PROGRESS' ? 'En progreso' :
                     statusFilter === 'COMPLETED' ? 'Completado' : statusFilter}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Colonia:</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {
                    // Ciclar entre colonias
                    const currentIndex = colonias.indexOf(coloniaFilter);
                    const nextIndex = (currentIndex + 1) % colonias.length;
                    setColoniaFilter(colonias[nextIndex]);
                  }}
                >
                  <Text style={styles.pickerButtonText} numberOfLines={1}>
                    {coloniaFilter === 'ALL' ? 'Todas' : coloniaFilter}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.hint}>Resultados: {filtered.length} proyecto(s)</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No se encontraron proyectos</Text>
            <Text style={styles.emptyDescription}>
              {query ? 'Intenta con otros términos de búsqueda' : 'Cambia los filtros para ver más proyectos'}
            </Text>
          </View>
        ) : (
          filtered.map(p => {
            const progress = (p.currentAmount / p.fundingGoal) * 100;
            const statusColor = 
              p.status === 'VOTING' ? '#3b82f6' :
              p.status === 'FUNDING' ? '#10b981' :
              p.status === 'IN_PROGRESS' ? '#f59e0b' :
              p.status === 'COMPLETED' ? '#6366f1' : '#6b7280';

            return (
              <TouchableOpacity key={p._id} style={styles.projectCard} onPress={() => openSuggestions(p)} activeOpacity={0.85}>
              {/* Header con imagen de fondo */}
              <View style={styles.cardHeader}>
                {p.coverImage ? (
                  <Image 
                    source={{ uri: p.coverImage }} 
                    style={styles.cardCoverImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardCoverPlaceholder, { backgroundColor: statusColor }]}>
                    <Text style={styles.placeholderIcon}>🏗️</Text>
                  </View>
                )}
                <View style={styles.cardOverlay}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusBadgeText}>{getStatusLabel(p.status)}</Text>
                  </View>
                </View>
              </View>

              {/* Contenido */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={styles.cardColonia}>📍 {p.colonia}</Text>
                
                <Text style={styles.cardDescription} numberOfLines={2}>{p.description}</Text>

                {/* Barra de progreso */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: statusColor }]} />
                  </View>
                  <View style={styles.progressInfo}>
                    <View>
                      <Text style={styles.progressAmount}>${p.currentAmount.toLocaleString()}</Text>
                      <Text style={styles.progressLabel}>recaudado</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.progressGoal}>${p.fundingGoal.toLocaleString()}</Text>
                      <Text style={styles.progressLabel}>meta</Text>
                    </View>
                  </View>
                </View>

                {/* Votos (si está en votación) */}
                {p.status === 'VOTING' && (
                  <View style={styles.votingInfo}>
                    <Text style={styles.votingText}>
                      🗳️ {p.votingStats.votesFor} de {p.votingStats.votesNeeded} votos necesarios
                    </Text>
                  </View>
                )}

                {/* Footer con fecha y botón */}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                    {p.creationDate ? formatDateLabel(p.creationDate.split('T')[0]) : ''}
                  </Text>
                  <TouchableOpacity style={[styles.viewButton, { borderColor: statusColor }]} onPress={() => openSuggestions(p)}>
                    <Text style={[styles.viewButtonText, { color: statusColor }]}>Ver detalles</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
        )}

        {/* CTA to create new project directly */}
        <View style={styles.createSection}>
          <Text style={styles.createSectionTitle}>¿No encuentras lo que buscas?</Text>
          <TouchableOpacity style={styles.createProjectCard} onPress={() => { setSelected(null); setCreateVisible(true); }}>
            <View style={styles.createIconContainer}>
              <Text style={styles.createIcon}>✨</Text>
            </View>
            <View style={styles.createContent}>
              <Text style={styles.createTitle}>Crear un nuevo proyecto</Text>
              <Text style={styles.createDescription}>Propón una iniciativa para mejorar tu comunidad</Text>
            </View>
            <View style={styles.createArrow}>
              <Text style={styles.createArrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Suggestions modal when selecting a project */}
      <Modal visible={suggModalVisible} animationType="slide" onRequestClose={() => setSuggModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          <Header showBack={true} onBack={() => setSuggModalVisible(false)} rightIconName="close" onRightPress={() => setSuggModalVisible(false)} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Header del proyecto */}
            {selected?.coverImage ? (
              <Image 
                source={{ uri: selected.coverImage }} 
                style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 16 }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 16, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 64 }}>🏗️</Text>
              </View>
            )}

            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: GRAY, marginBottom: 8 }}>{selected?.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: selected?.status === 'VOTING' ? '#3b82f6' :
                                 selected?.status === 'FUNDING' ? '#10b981' :
                                 selected?.status === 'IN_PROGRESS' ? '#f59e0b' :
                                 selected?.status === 'COMPLETED' ? '#6366f1' : '#6b7280',
                  marginRight: 8
                }]}>
                  <Text style={styles.statusBadgeText}>{selected && getStatusLabel(selected.status)}</Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>📍 {selected?.colonia}</Text>
              </View>
              <Text style={{ color: '#374151', fontSize: 15, lineHeight: 22 }}>{selected?.description}</Text>
            </View>

            {/* Progreso de fondeo */}
            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: GRAY, marginBottom: 12 }}>💰 Progreso de fondeo</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { 
                  width: `${Math.min((selected?.currentAmount || 0) / (selected?.fundingGoal || 1) * 100, 100)}%`,
                  backgroundColor: '#10b981'
                }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: GRAY }}>${selected?.currentAmount?.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>recaudado</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#6b7280' }}>${selected?.fundingGoal?.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>meta</Text>
                </View>
              </View>
            </View>

            {/* Votación */}
            {selected?.status === 'VOTING' && (
              <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e40af', marginBottom: 8 }}>🗳️ Votación activa</Text>
                <Text style={{ fontSize: 14, color: '#1e40af' }}>
                  {selected.votingStats.votesFor} de {selected.votingStats.votesNeeded} votos necesarios para aprobar el proyecto
                </Text>
                <View style={{ marginTop: 8, height: 6, backgroundColor: '#dbeafe', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ 
                    width: `${Math.min((selected.votingStats.votesFor / selected.votingStats.votesNeeded) * 100, 100)}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6'
                  }} />
                </View>
              </View>
            )}

            {/* Razones para apoyar */}
            <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: GRAY, marginBottom: 12 }}>✨ ¿Por qué apoyar este proyecto?</Text>
              {buildReasons(selected).map((r, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Text style={{ color: '#10b981', marginRight: 8 }}>✓</Text>
                  <Text style={{ color: '#374151', flex: 1, lineHeight: 20 }}>{r}</Text>
                </View>
              ))}
            </View>

            {/* Botones de acción */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }} 
                onPress={() => setSuggModalVisible(false)}
              >
                <Text style={{ color: GRAY, fontWeight: '700', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              {selected && selected.currentAmount >= selected.fundingGoal ? (
                <View style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}>
                  <Text style={{ color: '#6b7280', fontWeight: '700', fontSize: 15 }}>✓ Completado</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: RED, alignItems: 'center' }} 
                  onPress={() => selected && handleSupportProject(selected)}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Apoyar proyecto</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Create project modal (componentized) */}
      <CreateProjectModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onProjectCreated={() => {
          setCreateVisible(false);
          loadProjects();
          Alert.alert('Creado', 'Tu proyecto ha sido creado exitosamente.');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  searchArea: { padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: GRAY, marginBottom: 8 },
  input: { height: 44, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#eef2f6' },
  hint: { color: '#6b7280', marginTop: 8 },
  filtersContainer: { marginTop: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterItem: { flex: 1 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eef2f6' },
  pickerButton: { paddingVertical: 10, paddingHorizontal: 12 },
  pickerButtonText: { fontSize: 14, color: GRAY, fontWeight: '600' },
  
  // Nueva tarjeta de proyecto con diseño mejorado
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    height: 160,
    position: 'relative',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
  },
  cardCoverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GRAY,
    marginBottom: 6,
    lineHeight: 24,
  },
  cardColonia: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: GRAY,
  },
  progressLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  progressGoal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  votingInfo: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  votingText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  
  // Create project section
  createSection: {
    marginTop: 24,
    marginBottom: 80,
  },
  createSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 12,
  },
  createProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: RED,
    borderStyle: 'dashed',
  },
  createIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createIcon: {
    fontSize: 28,
  },
  createContent: {
    flex: 1,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GRAY,
    marginBottom: 4,
  },
  createDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  createArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createArrowIcon: {
    fontSize: 20,
    color: '#fff',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GRAY,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Estilos heredados
  createCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  formInput: { height: 44, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#eef2f6' },
});
