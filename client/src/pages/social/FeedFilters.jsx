import React from 'react';
import BaseLayout from '../../components/Layout/BaseLayout';
import FilterPanel from '../../components/Feed/FilterPanel';
import { useFeed } from '../../context/FeedContext';

export default function FeedFilters() {
  const feedContext = useFeed();
  
  // Debug: verificar que el contexto está disponible y los filtros se cargan
  React.useEffect(() => {
    console.log('FeedFilters mounted');
    console.log('FeedContext available:', !!feedContext);
    if (feedContext) {
      console.log('Filters loaded:', feedContext.filters);
    }
  }, [feedContext]);

  // Manejo de error si el contexto no está disponible
  if (!feedContext) {
    return (
      <BaseLayout title="Preferencias" showTabs={false} backPath="/feed">
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <p>Error: FeedContext no está disponible.</p>
          <p>Asegúrate de estar dentro de un FeedProvider.</p>
        </div>
      </BaseLayout>
    );
  }

  const { filters = {}, applyFilters } = feedContext;

  return (
    <BaseLayout title="Filtros" showTabs={false} backPath="/feed">
      <div style={{ 
        padding: '1rem', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 120px)',
        width: '100%',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ 
          width: 'min(600px, 100%)',
          maxWidth: '100%',
          opacity: 1,
          visibility: 'visible'
        }}>
          {console.log('Renderizando FilterPanel con filters:', filters)}
          <FilterPanel
            key={JSON.stringify(filters)} // Force re-render when filters change
            initialFilters={filters || {}}
            onApply={(f) => {
              console.log('Aplicando filtros:', f);
              if (applyFilters) {
                applyFilters(f);
              }
              window.history.back();
            }}
            onCancel={() => {
              console.log('Cancelando filtros');
              window.history.back();
            }}
          />
        </div>
      </div>
    </BaseLayout>
  );
}
