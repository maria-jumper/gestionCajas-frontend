const PAGE_META = {
  packages:   { title: "Paquetes",       desc: "Gestiona el inventario de cajas y paquetes.", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  deliveries: { title: "Entregas",       desc: "Administra rutas de entrega y confirmaciones.", icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" },
  tracking:   { title: "Seguimiento",    desc: "Monitorea el estado de tus envíos en tiempo real.", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  clients:    { title: "Clientes",       desc: "Administra tu base de clientes y contactos.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  reports:    { title: "Reportes",       desc: "Visualiza métricas y estadísticas de operación.", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  settings:   { title: "Configuración",  desc: "Personaliza la aplicación según tus necesidades.", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
};
 
export default function PlaceholderPage({ pageId }) {
  const meta = PAGE_META[pageId] ?? { title: pageId, desc: "Módulo en construcción.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" };
 
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 anim-fade-up">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--bg-hover)", color: "var(--accent)" }}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d={meta.icon}/>
        </svg>
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {meta.title}
        </h2>
        <p className="text-sm font-body max-w-xs" style={{ color: "var(--text-faint)" }}>
          {meta.desc}
        </p>
      </div>
      <span
        className="text-xs font-body px-3 py-1.5 rounded-full border font-medium"
        style={{ border: "1px solid var(--border-accent)", color: "var(--accent)", background: "var(--bg-hover)" }}
      >
        Módulo próximamente disponible
      </span>
    </div>
  );
}
 