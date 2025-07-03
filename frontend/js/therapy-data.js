// ===================================================================
// DATOS PREDEFINIDOS DE TERAPIAS - SOFTZEN V2.1
// Base de datos completa de posturas y terapias de yoga
// ===================================================================

// Datos de terapias predefinidas con videos de YouTube
const THERAPY_DATA = {
  anxiety: {
    id: 'anxiety',
    name: 'Ansiedad y Estrés',
    description: 'Posturas diseñadas para calmar el sistema nervioso y reducir la ansiedad',
    color: '#667eea',
    icon: '🧠',
    postures: [
      {
        id: 1,
        name: 'Postura del Niño',
        sanskrit: 'Balasana',
        instructions: 'Arrodíllate, junta los dedos gordos de los pies, separa las rodillas al ancho de las caderas, inclina el tronco hacia adelante apoyando la frente en el suelo y extiende los brazos al frente o a los lados.',
        benefits: 'Calma el sistema nervioso, estira la espalda baja y alivia la ansiedad. Proporciona una sensación de seguridad y protección.',
        modifications: 'Coloca una manta o cojín bajo la frente o entre los glúteos y los talones para mayor confort.',
        videoUrl: 'https://www.youtube.com/watch?v=wzQqaCiYCqs',
        image: 'https://resizer.glanacion.com/resizer/v2/contraindicaciones-la-instructora-asegura-que-no-K5MAD4UHDNAJJBYROTJSKDXGBY.jpg?auth=cd912d33fbfa6f1cc2350bd2104bcfc72d6c7efbc0eed3e7e33f6682ca8f2220&width=420&height=280&quality=70&smart=true',
        defaultDuration: 5,
        difficulty: 'principiante'
      },
      {
        id: 2,
        name: 'Gato-Vaca',
        sanskrit: 'Marjaryasana–Bitilasana',
        instructions: 'Colócate en cuatro apoyos; al inhalar baja el abdomen y levanta la mirada (Vaca), al exhalar redondea la espalda y mete la barbilla al pecho (Gato). Repite de 5 a 10 veces al ritmo de tu respiración.',
        benefits: 'Libera tensión en la columna, mejora la movilidad vertebral y reduce el estrés. Ayuda a conectar con la respiración.',
        modifications: 'Apoya las manos sobre bloques si sientes presión en las muñecas.',
        videoUrl: 'https://www.youtube.com/watch?v=yMjXE5Nk6vs',
        image: 'https://cdn.xuanlanyoga.com/wp-content/uploads/2022/04/gato-vaca-yoga.jpg',
        defaultDuration: 3,
        difficulty: 'principiante'
      },
      {
        id: 3,
        name: 'Perro Boca Abajo',
        sanskrit: 'Adho Mukha Svanasana',
        instructions: 'Desde cuatro apoyos, estira las piernas y eleva las caderas hacia el techo en forma de V invertida, mantén los talones intentando acercarlos al suelo y las manos firmes en la esterilla.',
        benefits: 'Estira la columna, fortalece brazos y piernas, mejora la circulación y calma la mente. Revitaliza todo el cuerpo.',
        modifications: 'Dobla ligeramente las rodillas o apoya las manos en el borde de una silla para aliviar la carga en hombros y isquios.',
        videoUrl: 'https://www.youtube.com/watch?v=OPe26Wd-PfM',
        image: 'https://guiafitness.com/wp-content/uploads/postura-del-perro-boca-abajo.jpg',
        defaultDuration: 4,
        difficulty: 'intermedio'
      },
      {
        id: 4,
        name: 'Postura del Árbol',
        sanskrit: 'Vrksasana',
        instructions: 'De pie, apoya la planta de un pie en el muslo o pantorrilla contraria (evita la rodilla), estabiliza la mirada y junta las palmas en Namaste o lleva los brazos por encima de la cabeza.',
        benefits: 'Mejora el equilibrio físico y mental, promueve la concentración y reduce la ansiedad. Fortalece la conexión mente-cuerpo.',
        modifications: 'Apoya la espalda contra la pared o deja el pie a la pantorrilla en lugar del muslo si eres principiante.',
        videoUrl: 'https://www.youtube.com/watch?v=i6gWt0n7Hv8',
        image: 'https://www.hola.com/horizon/original_aspect_ratio/581a0419f0a5-arbol-facil-z.jpg',
        defaultDuration: 3,
        difficulty: 'intermedio'
      },
      {
        id: 5,
        name: 'Piernas en la Pared',
        sanskrit: 'Viparita Karani',
        instructions: 'Siéntate de lado a la pared, gira el cuerpo y eleva las piernas apoyándolas verticalmente contra la pared, brazos relajados a los lados.',
        benefits: 'Reduce el estrés, alivia la tensión en piernas y espalda, y calma profundamente el sistema nervioso. Postura restaurativa ideal.',
        modifications: 'Coloca una manta o cojín bajo las caderas para mayor elevación y confort.',
        videoUrl: 'https://www.youtube.com/shorts/2Z2jxqSJ0IA',
        image: 'https://img.huffingtonpost.es/files/image_1200_720/uploads/2024/08/29/una-mujer-con-las-piernas-en-la-pared.jpeg',
        defaultDuration: 8,
        difficulty: 'principiante'
      },
      {
        id: 6,
        name: 'Postura del Ángulo Atado',
        sanskrit: 'Baddha Konasana',
        instructions: 'Siéntate con las piernas extendidas, junta las plantas de los pies y acerca los talones al perineo, sujeta los pies con las manos y, con la espalda recta, inclínate ligeramente hacia adelante.',
        benefits: 'Abre las caderas, mejora la circulación en la zona pélvica y alivia la ansiedad. Promueve la introspección y calma.',
        modifications: 'Coloca cojines bajo las rodillas o bajo los glúteos para mayor comodidad.',
        videoUrl: 'https://www.youtube.com/watch?v=X2POKG8Fp2M',
        image: 'https://www.relajemos.com/wp-content/uploads/2017/01/asana-baddha-konasana.jpg',
        defaultDuration: 6,
        difficulty: 'principiante'
      }
    ]
  },

  arthritis: {
    id: 'arthritis',
    name: 'Artritis y Rigidez Articular',
    description: 'Posturas suaves para mejorar la movilidad y reducir la rigidez articular',
    color: '#f093fb',
    icon: '🦴',
    postures: [
      {
        id: 7,
        name: 'Cobra',
        sanskrit: 'Bhujangasana',
        instructions: 'Recuéstate boca abajo, manos debajo de los hombros, al inhalar presiona con las manos para levantar ligeramente el pecho manteniendo los codos semiflexionados.',
        benefits: 'Fortalece la musculatura de la espalda, mejora la movilidad vertebral y alivia la rigidez articular. Mantiene la columna flexible.',
        modifications: 'Levanta solo el pecho y mantén la pelvis apoyada en el suelo para reducir la presión lumbar.',
        videoUrl: 'https://www.youtube.com/watch?v=niehLCrs8b8',
        image: 'https://www.vikika.es/blog/wp-content/uploads/2021/07/postura-cobra.jpg',
        defaultDuration: 4,
        difficulty: 'principiante'
      },
      {
        id: 8,
        name: 'Puente',
        sanskrit: 'Setu Bandha Sarvāṅgāsana',
        instructions: 'Acuéstate boca arriba con rodillas dobladas y pies en el suelo, al inhalar eleva la pelvis llevando el sacro hacia arriba y mantén los hombros y pies firmes.',
        benefits: 'Estira la columna y los flexores de la cadera, fortalece glúteos y alivia el dolor articular. Mejora la postura.',
        modifications: 'Coloca un bloque o cojín bajo el sacro para soporte y menor esfuerzo muscular.',
        videoUrl: 'https://www.youtube.com/watch?v=H-luTmFk-h0',
        image: 'https://www.sportlife.es/uploads/s1/75/69/29/5/5d38604d0ee6949b4934991d-beneficios-de-la-postura-del-puente-o-medio-puente-setu-bandha-sarvangasana.jpeg',
        defaultDuration: 5,
        difficulty: 'intermedio'
      },
      {
        id: 9,
        name: 'Camello',
        sanskrit: 'Ustrasana',
        instructions: 'Arrodíllate con las rodillas al ancho de caderas, lleva las manos a las caderas o a los talones y abre el pecho arqueando suavemente la espalda.',
        benefits: 'Abre la caja torácica, mejora la movilidad de la columna y alivia la rigidez en hombros y cuello. Aumenta la confianza.',
        modifications: 'Deja las manos en las caderas o apoya la espalda contra la pared para control de la profundidad.',
        videoUrl: 'https://m.youtube.com/watch?v=QPD8S5g9CwA',
        image: 'https://cdn.xuanlanyoga.com/wp-content/uploads/2020/12/ustrasana-1200x900.jpg',
        defaultDuration: 4,
        difficulty: 'avanzado'
      },
      {
        id: 10,
        name: 'Pinza Sentada',
        sanskrit: 'Paschimottanasana',
        instructions: 'Siéntate con las piernas extendidas, flexiona el tronco hacia adelante desde las caderas y agarra los pies o las pantorrillas.',
        benefits: 'Estira la espalda baja y los isquiotibiales, aliviando la tensión en las articulaciones de la cadera. Mejora la digestión.',
        modifications: 'Flexiona las rodillas o usa una cinta alrededor de los pies para poder sostenerte mejor.',
        videoUrl: 'https://www.youtube.com/watch?v=WUitD3qgv84',
        image: 'https://cdn.xuanlanyoga.com/wp-content/uploads/2016/02/paschimottanasana.jpg',
        defaultDuration: 6,
        difficulty: 'intermedio'
      },
      {
        id: 11,
        name: 'Pez',
        sanskrit: 'Matsyasana',
        instructions: 'Recuéstate boca arriba, coloca los brazos bajo tu cuerpo, arquea el pecho hacia arriba apoyando la coronilla o un bloque.',
        benefits: 'Abre el pecho, estira cuello y hombros, alivia la tensión articular en la parte superior del cuerpo. Contrarresta la postura encorvada.',
        modifications: 'Apoya la cabeza sobre un cojín o bloque para mayor confort cervical.',
        videoUrl: 'https://www.youtube.com/watch?v=fg9rJq_yep8',
        image: 'https://www.sportlife.es/uploads/s1/97/10/97/2/postura-del-pez-o-matsyasana-para-principiantes_7_1200x690.jpeg',
        defaultDuration: 5,
        difficulty: 'intermedio'
      },
      {
        id: 12,
        name: 'Perro Boca Abajo Modificado',
        sanskrit: 'Adho Mukha Svanasana',
        instructions: 'Desde cuatro apoyos, empuja las caderas hacia arriba y atrás en la forma de una V invertida, manteniendo los talones hacia el suelo.',
        benefits: 'Estira brazos, espalda y piernas, ayuda a aliviar la rigidez articular de manos y hombros. Aumenta la movilidad general.',
        modifications: 'Apoya las manos en bloques o una silla para reducir la carga en muñecas y hombros.',
        videoUrl: 'https://www.youtube.com/watch?v=G74sC-56ops',
        image: 'https://guiafitness.com/wp-content/uploads/postura-del-perro-boca-abajo.jpg',
        defaultDuration: 4,
        difficulty: 'intermedio'
      }
    ]
  },

  back_pain: {
    id: 'back_pain',
    name: 'Dolor de Espalda',
    description: 'Secuencia terapéutica para aliviar y prevenir el dolor de espalda',
    color: '#4ecdc4',
    icon: '🔥',
    postures: [
      {
        id: 13,
        name: 'Postura del Niño',
        sanskrit: 'Balasana',
        instructions: 'Arrodíllate y siéntate sobre los talones, separa las rodillas al ancho de la esterilla y estira los brazos al frente dejando la frente apoyada.',
        benefits: 'Alivia la compresión lumbar, estira la espalda y relaja la musculatura baja. Postura de descanso y relajación.',
        modifications: 'Separa más las rodillas o coloca cojines bajo el torso según necesites.',
        videoUrl: 'https://www.youtube.com/watch?v=wzQqaCiYCqs',
        image: 'https://resizer.glanacion.com/resizer/v2/contraindicaciones-la-instructora-asegura-que-no-K5MAD4UHDNAJJBYROTJSKDXGBY.jpg?auth=cd912d33fbfa6f1cc2350bd2104bcfc72d6c7efbc0eed3e7e33f6682ca8f2220&width=420&height=280&quality=70&smart=true',
        defaultDuration: 6,
        difficulty: 'principiante'
      },
      {
        id: 14,
        name: 'Rodillas al Pecho',
        sanskrit: 'Apanasana',
        instructions: 'Acuéstate boca arriba, dobla las rodillas y abraza con las manos acercándolas al pecho, mantén la respiración suave.',
        benefits: 'Relaja la zona lumbar, alivia la tensión en la parte baja de la espalda. Proporciona masaje lumbar natural.',
        modifications: 'Abraza una rodilla a la vez si sientes incomodidad al juntar ambas.',
        videoUrl: 'https://www.youtube.com/watch?v=Y9G2GpODWmk',
        image: 'https://gourmetdemexico.com.mx/wp-content/uploads/2016/06/postura-yoga-apanasana-rodillas-en-el-pecho-300x200.jpg',
        defaultDuration: 4,
        difficulty: 'principiante'
      },
      {
        id: 15,
        name: 'Cobra Suave',
        sanskrit: 'Bhujangasana',
        instructions: 'Boca abajo, manos bajo los hombros, al inhalar levanta suavemente el pecho manteniendo la pelvis en el suelo.',
        benefits: 'Fortalece la musculatura extensora de la espalda y reduce la tensión lumbar. Mejora la alineación espinal.',
        modifications: 'Mantén los codos doblados para evitar sobreextender la zona baja.',
        videoUrl: 'https://www.youtube.com/watch?v=9DN7TheUAto',
        image: 'https://www.vikika.es/blog/wp-content/uploads/2021/07/postura-cobra.jpg',
        defaultDuration: 3,
        difficulty: 'principiante'
      },
      {
        id: 16,
        name: 'Flexión de Pie',
        sanskrit: 'Uttanasana',
        instructions: 'De pie, separa ligeramente las piernas, inclínate hacia adelante desde las caderas dejando caer la cabeza y agarra los codos o espinillas.',
        benefits: 'Estira isquiotibiales y zona lumbar, aliviando la tensión en la espalda. Promueve bienestar integral.',
        modifications: 'Flexiona ligeramente las rodillas y usa bloques bajo las manos si no llegas al suelo.',
        videoUrl: 'https://www.youtube.com/watch?v=n2uowGJZ3vg',
        image: 'https://cdn.xuanlanyoga.com/wp-content/uploads/2022/06/uttanasana-postura-de-la-pinza-yoga-1200x900.jpg',
        defaultDuration: 5,
        difficulty: 'intermedio'
      },
      {
        id: 17,
        name: 'Puente Terapéutico',
        sanskrit: 'Setu Bandha Sarvāṅgāsana',
        instructions: 'Recuéstate boca arriba con rodillas dobladas y pies apoyados; al inhalar eleva la pelvis apretando glúteos y mantén hombros firmes.',
        benefits: 'Fortalece glúteos y espalda baja, alivia dolores lumbares. Fortalecimiento general de la cadena posterior.',
        modifications: 'Coloca un bloque bajo el sacro para soporte extra.',
        videoUrl: 'https://www.youtube.com/watch?v=JMiMsJt7C88',
        image: 'https://www.sportlife.es/uploads/s1/75/69/29/5/5d38604d0ee6949b4934991d-beneficios-de-la-postura-del-puente-o-medio-puente-setu-bandha-sarvangasana.jpeg',
        defaultDuration: 4,
        difficulty: 'intermedio'
      },
      {
        id: 18,
        name: 'Gato-Vaca para Espalda',
        sanskrit: 'Marjaryasana–Bitilasana',
        instructions: 'Desde posición de cuatro apoyos, alterna entre arquear y redondear la espalda siguiendo el ritmo de la respiración.',
        benefits: 'Estira la espalda completa, descomprime vértebras y alivia la rigidez. Mantiene la columna móvil y saludable.',
        modifications: 'Muévete lentamente y dentro de un rango cómodo de movimiento.',
        videoUrl: 'https://www.youtube.com/watch?v=yMjXE5Nk6vs',
        image: 'https://cdn.xuanlanyoga.com/wp-content/uploads/2022/04/gato-vaca-yoga.jpg',
        defaultDuration: 3,
        difficulty: 'principiante'
      }
    ]
  }
};

// Configuraciones predefinidas de series
const PRESET_SERIES = [
  {
    id: 'anxiety-beginner',
    name: 'Calma Mental - Principiante',
    description: 'Serie suave para reducir ansiedad y estrés',
    therapyType: 'anxiety',
    level: 'principiante',
    duration: 20,
    postures: [1, 2, 4, 5, 6],
    isPublic: true
  },
  {
    id: 'arthritis-gentle',
    name: 'Movilidad Articular Suave',
    description: 'Mejora la flexibilidad y reduce la rigidez',
    therapyType: 'arthritis',
    level: 'principiante',
    duration: 25,
    postures: [7, 8, 10, 11],
    isPublic: true
  },
  {
    id: 'back-pain-relief',
    name: 'Alivio Dolor de Espalda',
    description: 'Secuencia terapéutica para la espalda',
    therapyType: 'back_pain',
    level: 'principiante',
    duration: 22,
    postures: [13, 14, 15, 17, 18],
    isPublic: true
  },
  {
    id: 'anxiety-intermediate',
    name: 'Equilibrio Mental - Intermedio',
    description: 'Práctica más profunda para calmar la mente',
    therapyType: 'anxiety',
    level: 'intermedio',
    duration: 35,
    postures: [1, 2, 3, 4, 5, 6],
    isPublic: true
  },
  {
    id: 'complete-mobility',
    name: 'Movilidad Completa',
    description: 'Secuencia integral para artritis avanzada',
    therapyType: 'arthritis',
    level: 'intermedio',
    duration: 40,
    postures: [7, 8, 9, 10, 11, 12],
    isPublic: true
  }
];

// Utilidades para trabajar con los datos
const TherapyDataUtils = {
  // Obtener todas las terapias
  getAllTherapies() {
    return Object.values(THERAPY_DATA);
  },

  // Obtener terapia por ID
  getTherapyById(id) {
    return THERAPY_DATA[id] || null;
  },

  // Obtener postura por ID
  getPostureById(postureId) {
    for (const therapy of Object.values(THERAPY_DATA)) {
      const posture = therapy.postures.find(p => p.id === postureId);
      if (posture) {
        return { ...posture, therapyType: therapy.id };
      }
    }
    return null;
  },

  // Obtener posturas por terapia
  getPosturesByTherapy(therapyId) {
    const therapy = this.getTherapyById(therapyId);
    return therapy ? therapy.postures : [];
  },

  // Obtener series predefinidas
  getPresetSeries() {
    return PRESET_SERIES;
  },

  // Obtener series por nivel
  getSeriesByLevel(level) {
    return PRESET_SERIES.filter(series => series.level === level);
  },

  // Obtener series por tipo de terapia
  getSeriesByTherapy(therapyType) {
    return PRESET_SERIES.filter(series => series.therapyType === therapyType);
  },

  // Crear serie personalizada a partir de posturas
  createCustomSeries(name, description, postureIds, duration) {
    const postures = postureIds.map(id => this.getPostureById(id)).filter(Boolean);
    const therapyTypes = [...new Set(postures.map(p => p.therapyType))];
    
    return {
      id: `custom-${Date.now()}`,
      name,
      description,
      therapyType: therapyTypes.length === 1 ? therapyTypes[0] : 'mixed',
      level: this.calculateDifficulty(postures),
      duration: duration || this.calculateDuration(postures),
      postures: postureIds,
      isCustom: true,
      createdAt: new Date()
    };
  },

  // Calcular dificultad basada en las posturas
  calculateDifficulty(postures) {
    const difficulties = postures.map(p => p.difficulty);
    const hasAdvanced = difficulties.includes('avanzado');
    const hasIntermediate = difficulties.includes('intermedio');
    
    if (hasAdvanced) return 'avanzado';
    if (hasIntermediate) return 'intermedio';
    return 'principiante';
  },

  // Calcular duración total estimada
  calculateDuration(postures) {
    return postures.reduce((total, posture) => total + (posture.defaultDuration || 3), 0);
  },

  // Filtrar posturas por dificultad
  getPosturesByDifficulty(difficulty) {
    const allPostures = [];
    Object.values(THERAPY_DATA).forEach(therapy => {
      therapy.postures.forEach(posture => {
        if (posture.difficulty === difficulty) {
          allPostures.push({ ...posture, therapyType: therapy.id });
        }
      });
    });
    return allPostures;
  },

  // Buscar posturas por nombre o beneficios
  searchPostures(query) {
    const allPostures = [];
    const searchTerm = query.toLowerCase();
    
    Object.values(THERAPY_DATA).forEach(therapy => {
      therapy.postures.forEach(posture => {
        const matchesName = posture.name.toLowerCase().includes(searchTerm);
        const matchesSanskrit = posture.sanskrit.toLowerCase().includes(searchTerm);
        const matchesBenefits = posture.benefits.toLowerCase().includes(searchTerm);
        
        if (matchesName || matchesSanskrit || matchesBenefits) {
          allPostures.push({ ...posture, therapyType: therapy.id });
        }
      });
    });
    
    return allPostures;
  },

  // Generar secuencia recomendada
  generateRecommendedSequence(therapyType, level, duration) {
    const therapy = this.getTherapyById(therapyType);
    if (!therapy) return null;

    let postures = therapy.postures.filter(p => {
      if (level === 'principiante') return p.difficulty !== 'avanzado';
      if (level === 'intermedio') return p.difficulty !== 'avanzado';
      return true; // Para avanzado, incluir todas
    });

    // Ordenar por dificultad y duración
    postures.sort((a, b) => {
      const difficultyOrder = { 'principiante': 1, 'intermedio': 2, 'avanzado': 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    // Seleccionar posturas que encajen en la duración
    const selectedPostures = [];
    let totalDuration = 0;

    for (const posture of postures) {
      if (totalDuration + posture.defaultDuration <= duration) {
        selectedPostures.push(posture);
        totalDuration += posture.defaultDuration;
      }
    }

    return this.createCustomSeries(
      `Secuencia ${therapy.name} - ${level}`,
      `Secuencia recomendada de ${duration} minutos`,
      selectedPostures.map(p => p.id),
      duration
    );
  }
};

// Hacer disponible globalmente
window.THERAPY_DATA = THERAPY_DATA;
window.PRESET_SERIES = PRESET_SERIES;
window.TherapyDataUtils = TherapyDataUtils;

console.log('🧘‍♀️ Datos de terapias cargados:', Object.keys(THERAPY_DATA).length, 'terapias');
console.log('📋 Series predefinidas cargadas:', PRESET_SERIES.length, 'series');
