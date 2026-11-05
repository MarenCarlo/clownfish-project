import mysql from 'mysql2/promise';

interface DepartmentRow {
  id: string;
  code: string;
  nombre: string;
}

interface MinfinGeometry {
  properties: {
    id: number;
    Municipio: string;
    Departamento: string;
    id_depto: number;
  };
}

const TARGET_DEPTOS = ['Izabal', 'Zacapa', 'Chiquimula', 'Jalapa', 'Jutiapa'];

async function run() {
  const host = process.env.DB_HOST || '192.168.250.99';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'remote_admin';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'ClownfishDB';

  console.log(`Conectando a MariaDB en ${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    // 1. Obtener departamentos registrados en tb_departamentos
    const [deptRows] = await conn.execute(
      'SELECT id, code, nombre FROM tb_departamentos WHERE is_active = 1'
    );
    const departments = deptRows as DepartmentRow[];
    console.log(`Departamentos encontrados en BD: ${departments.length}`);

    const deptoMapByName = new Map<string, DepartmentRow>();
    const deptoMapByCode = new Map<string, DepartmentRow>();
    for (const d of departments) {
      deptoMapByName.set(d.nombre.toLowerCase().trim(), d);
      deptoMapByCode.set(d.code.trim(), d);
    }

    // 2. Obtener datos de municipios desde el repositorio oficial de MINFIN
    console.log('Descargando catálogo oficial de municipios desde MINFIN (Guatemala)...');
    const res = await fetch(
      'https://raw.githubusercontent.com/minfin-bi/Mapas-TopoJSON-Guatemala/master/munis.json'
    );
    if (!res.ok) {
      throw new Error(`Error al descargar recurso de MINFIN: ${res.statusText}`);
    }
    const topoJson = (await res.json()) as {
      objects: {
        municipios_gtm: {
          geometries: MinfinGeometry[];
        };
      };
    };
    const geoms: MinfinGeometry[] = topoJson.objects.municipios_gtm.geometries;

    const filtered = geoms
      .map((g) => g.properties)
      .filter((p) => TARGET_DEPTOS.includes(p.Departamento));

    console.log(`Total municipios encontrados para la región objetivo: ${filtered.length}`);

    // 3. Insertar municipios en tb_municipios
    let inserted = 0;
    for (const m of filtered) {
      const depto = deptoMapByName.get(m.Departamento.toLowerCase().trim());
      if (!depto) {
        console.warn(`No se encontró el departamento en BD para: ${m.Departamento}`);
        continue;
      }

      const codeStr = String(m.id);
      const nombre = m.Municipio.trim();

      await conn.execute(
        `INSERT INTO tb_municipios (id, departamento_id, code, nombre, display_order, is_active)
         VALUES (UUID(), ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           departamento_id = VALUES(departamento_id),
           nombre = VALUES(nombre),
           display_order = VALUES(display_order),
           is_active = 1`,
        [depto.id, codeStr, nombre, m.id]
      );
      inserted++;
    }

    console.log(`\nImportación completada con éxito. Total municipios importados/actualizados: ${inserted}`);

    // 4. Mostrar resumen por departamento
    for (const d of TARGET_DEPTOS) {
      const depto = deptoMapByName.get(d.toLowerCase());
      if (depto) {
        const [munis] = await conn.execute(
          'SELECT COUNT(*) as count FROM tb_municipios WHERE departamento_id = ?',
          [depto.id]
        );
        const count = (munis as { count: number }[])[0].count;
        console.log(`- ${d}: ${count} municipios`);
      }
    }
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('Error durante la importación:', err);
  process.exit(1);
});
