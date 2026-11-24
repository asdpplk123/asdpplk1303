import { CropId, NeedLevel, ReliefCropData, SunPreset, WeatherType } from '../types/botany';

export const NEED_LABELS: Record<NeedLevel, string> = {
  low: '적음',
  medium: '보통',
  high: '많음',
};

export const SUN_LABELS: Record<SunPreset, string> = {
  morning: '아침 햇살',
  noon: '한낮 직사광',
  sunset: '노을 반양지',
  night: '밤 달빛',
};

export const SEASON_SHORT_LABELS: Record<SunPreset, string> = {
  morning: '아침',
  noon: '낮',
  sunset: '노을',
  night: '밤',
};

export const WEATHER_LABELS: Record<WeatherType, string> = {
  clear: '맑음',
  cloudy: '흐림',
  rain: '비',
  snow: '눈',
};

export const RELIEF_CROPS: ReliefCropData[] = [
  {
    id: 'sweet_potato',
    nameKo: '고구마',
    hanja: '甘藷',
    scientificName: 'Ipomoea batatas',
    familyKo: '메꽃과 (Convolvulaceae)',
    categoryLabel: '대표 구황작물 · 덩이뿌리',
    ediblePart: '덩이뿌리(괴근), 어린 잎·줄기',
    seasonLabel: '봄 파종 · 가을 수확 (5~10월)',
    growthDurationSec: 22,
    harvestYield: 4,
    seedYield: 2,
    cultivation: {
      growthRateLabel: '보통',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: true,
      waterConsumptionPerSec: 0.015,
      sunNeed: 'high',
      optimalSun: 'noon',
      sunlightBonusFactor: 1.35,
      droughtPenaltyFactor: 0.9,
      conditionSummary: '물 1회 이상 + 배수 안정 + 한낮 직사광',
    },
    wildSpawn: {
      allowedSeasons: ['summer', 'autumn'],
      allowedSuns: ['noon', 'sunset'],
      allowedWeathers: ['clear'],
      spawnChance: 0.42,
      minRespawnSec: 22,
      conditionLabel: '여름·가을 · 맑은 날 (42% 확률)',
    },
    accentHex: '#B84A5B',
    foliageHex: '#4E8C45',
    flowerHex: '#E5B8D0',
    tuberHex: '#A63A4B',
    summary:
      '척박한 땅과 가뭄에도 뿌리를 깊게 내려 높은 열량을 내는 조선 후기 대표 구황작물입니다.',
    morphology:
      '줄기가 땅 위를 기며 뻗어 나가는 덩굴성 여러해살이풀로, 마디마다 잔뿌리가 내리며 하트 모양 또는 손바닥 모양의 잎이 어긋납니다. 땅속에서는 전분이 풍부한 방추형 덩이뿌리가 자랍니다.',
    reliefHistory:
      '1763년(영조 39년) 조엄이 통신사로 일본 대마도를 다녀오며 종자를 들여온 이후 남부 해안과 내륙으로 급속히 보급되어 흉년기 백성의 굶주림을 구제한 핵심 작물입니다.',
    habitat: {
      category: 'hillside',
      zoneName: '양지바른 사질토 산비탈 밭',
      soilType: '배수가 잘되는 사질양토 및 적황색 밭흙 (pH 5.5~6.5)',
      sunlight: '일조량이 풍부한 양지 (하루 6시간 이상 직사광선)',
      moisture: '적습 및 약건조 (과습 시 뿌리 부패 주의)',
      altitude: '해발 50~500m의 온난한 구릉지 및 밭',
      distribution: '전국 농경지, 특히 해남·여주·강화 등 남부 및 중부 사질토 지대',
      worldFocusPoint: [-14, 1.8, -11],
    },
    nutritionPer100g: {
      caloriesKcal: 128,
      carbsG: 30.2,
      fiberG: 3.0,
      proteinG: 1.6,
      fatG: 0.2,
      keyNutrients: [
        { name: '베타카로틴 (비타민 A 전구체)', amount: '709', unit: 'µg RAE', dailyPercent: 79, highlight: '강력한 항산화 및 시력 보호' },
        { name: '비타민 C', amount: '19.6', unit: 'mg', dailyPercent: 20, highlight: '전분에 둘러싸여 가열 손실이 적음' },
        { name: '칼륨', amount: '475', unit: 'mg', dailyPercent: 14, highlight: '나트륨 배출 및 혈압 조절' },
        { name: '식이섬유 (얄라핀)', amount: '3.0', unit: 'g', dailyPercent: 12, highlight: '장 연동 운동 촉진' },
      ],
    },
    benefits: [
      {
        title: '장 건강 및 변비 완화',
        compound: '얄라핀(Jalapin) · 불용성 식이섬유',
        description:
          '생고구마를 자를 때 나오는 하얀 진액 속 얄라핀 성분과 풍부한 식이섬유가 장내 유익균을 돕고 배변 활동을 원활하게 합니다.',
      },
      {
        title: '혈압 안정 및 부종 완화',
        compound: '칼륨(K) · 안토시아닌',
        description:
          '풍부한 칼륨이 체내 여분의 나트륨을 배출해 혈압 균형을 유지하며, 껍질의 폴리페놀은 혈관 산화를 억제합니다.',
      },
      {
        title: '점막 보호 및 항산화 작용',
        compound: '베타카로틴 · 비타민 C',
        description:
          '노란 과육에 풍부한 베타카로틴이 면역 방어막을 강화하고 활성산소로 인한 세포 손상을 줄입니다.',
      },
    ],
    preparation:
      '껍질째 찌거나 구워 먹으면 베타카로틴과 안토시아닌 섭취 효율이 높아집니다. 어린 줄기(고구마순)는 껍질을 벗겨 나물이나 들깨볶음으로 활용합니다.',
    caution:
      '혈당 지수가 조리법(군고구마)에 따라 상승할 수 있으므로 당뇨 관리가 필요한 경우 쪄서 적정량을 섭취하고, 공복에 과다 섭취하면 위산 역류가 생길 수 있습니다.',
  },
  {
    id: 'potato',
    nameKo: '감자',
    hanja: '馬鈴薯',
    scientificName: 'Solanum tuberosum',
    familyKo: '가지과 (Solanaceae)',
    categoryLabel: '고랭지 구황작물 · 덩이줄기',
    ediblePart: '덩이줄기(괴경)',
    seasonLabel: '이른 봄 심기 · 초여름 수확 (3~7월)',
    growthDurationSec: 19,
    harvestYield: 4,
    seedYield: 2,
    cultivation: {
      growthRateLabel: '보통',
      waterNeed: 'high',
      requiredWaterings: 2,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.025,
      sunNeed: 'medium',
      optimalSun: 'morning',
      sunlightBonusFactor: 1.25,
      droughtPenaltyFactor: 0.65,
      conditionSummary: '물 2회 이상 + 아침 서늘한 햇살',
    },
    wildSpawn: {
      allowedSeasons: ['spring', 'summer'],
      allowedSuns: ['morning', 'noon'],
      allowedWeathers: ['cloudy', 'rain'],
      spawnChance: 0.4,
      minRespawnSec: 20,
      conditionLabel: '봄·여름 · 흐림/비 (40% 확률)',
    },
    accentHex: '#C49A45',
    foliageHex: '#3E7A3B',
    flowerHex: '#F3F4F6',
    tuberHex: '#C7A26B',
    summary:
      '서늘한 산간 고지대에서도 생육 기간이 짧아 빠르게 수확할 수 있는 전분질 구황작물입니다.',
    morphology:
      '줄기는 모가 지고 곧게 자라며 깃꼴 겹잎을 가집니다. 여름철 가지 끝에 별 모양의 흰색 또는 연보라색 꽃이 피고, 땅속 기는줄기 끝이 비대해져 둥근 덩이줄기를 형성합니다.',
    reliefHistory:
      '1824년(순조 24년) 무렵 청나라를 거쳐 북부 산간 지역으로 유입된 뒤, 벼농사가 어려운 함경도·강원도 화전민과 고랭지 백성의 생명을 지탱한 ‘하지감자’의 주역입니다.',
    habitat: {
      category: 'highland',
      zoneName: '서늘한 고랭지 · 배수 양호한 산간 밭',
      soilType: '통기성이 좋은 약산성 양토 (pH 5.2~6.0)',
      sunlight: '충분한 햇볕과 서늘한 기온 (15~20°C 적온)',
      moisture: '괴경 비대기에는 적당한 수분이 필요하나 물고임은 금물',
      altitude: '해발 400~1,100m 고랭지 및 서늘한 중산간',
      distribution: '강원도 대관령·평창 고랭지 및 전국 봄·가을 이모작 밭',
      worldFocusPoint: [15, 3.0, -14],
    },
    nutritionPer100g: {
      caloriesKcal: 77,
      carbsG: 17.5,
      fiberG: 2.2,
      proteinG: 2.0,
      fatG: 0.1,
      keyNutrients: [
        { name: '비타민 C', amount: '19.7', unit: 'mg', dailyPercent: 20, highlight: '‘땅속의 사과’로 불릴 만큼 풍부' },
        { name: '칼륨', amount: '421', unit: 'mg', dailyPercent: 12, highlight: '체내 수분·전해질 균형 유지' },
        { name: '비타민 B6', amount: '0.30', unit: 'mg', dailyPercent: 20, highlight: '아미노산 대사 및 신경 전달' },
        { name: '판토텐산', amount: '0.30', unit: 'mg', dailyPercent: 6, highlight: '피로 회복 및 에너지 생성' },
      ],
    },
    benefits: [
      {
        title: '위 점막 보호 및 진정',
        compound: '아르기닌 · 판토텐산 · 알칼리성 미네랄',
        description:
          '감자의 아르기닌 성분은 위벽에 보호막을 형성해 위산 자극을 완화하고 염증 진정에 도움을 줍니다.',
      },
      {
        title: '면역력 강화 및 피로 회복',
        compound: '전분 보호 비타민 C · 비타민 B6',
        description:
          '감자의 전분이 비타민 C를 감싸 열에 의한 파괴를 막아주므로 익혀 먹어도 항산화·피로 회복 효과를 얻기 좋습니다.',
      },
      {
        title: '저열량 포만감 제공',
        compound: '저항성 전분 · 식이섬유',
        description:
          '쌀밥 대비 열량이 낮고 저항성 전분을 함유해 체중 조절과 완만한 혈당 유지에 유리합니다.',
      },
    ],
    preparation:
      '소금을 곁여 찌거나 국·조림으로 조리하며, 햇볕에 닿아 녹색으로 변한 껍질과 싹은 깊이 도려낸 후 조리해야 합니다.',
    caution:
      '싹이 나거나 녹색으로 변한 부위에는 독성 알칼로이드인 솔라닌(Solanine)과 차코닌이 축적되므로 반드시 완전히 제거하고 섭취하세요.',
  },
  {
    id: 'buckwheat',
    nameKo: '메밀',
    hanja: '蕎麥',
    scientificName: 'Fagopyrum esculentum',
    familyKo: '마디풀과 (Polygonaceae)',
    categoryLabel: '속성 구황작물 · 씨앗 곡물',
    ediblePart: '씨앗(메밀쌀), 어린 잎',
    seasonLabel: '여름 파종 · 가을 수확 (7~10월)',
    growthDurationSec: 13,
    harvestYield: 5,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '빠름',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: true,
      waterConsumptionPerSec: 0.014,
      sunNeed: 'medium',
      optimalSun: 'morning',
      sunlightBonusFactor: 1.25,
      droughtPenaltyFactor: 0.92,
      conditionSummary: '물 1회 + 배수 안정 + 아침 햇살',
    },
    wildSpawn: {
      allowedSeasons: ['summer', 'autumn'],
      allowedSuns: ['morning', 'sunset'],
      allowedWeathers: ['clear', 'cloudy'],
      spawnChance: 0.48,
      minRespawnSec: 16,
      conditionLabel: '여름·가을 · 맑음/흐림 (48% 확률)',
    },
    accentHex: '#D97B8C',
    foliageHex: '#598A42',
    flowerHex: '#FFFDF7',
    tuberHex: '#5E4B3E',
    summary:
      '파종 후 70~80일 만에 수확할 수 있어 흉작이나 수해 후 긴급 대체 작물로 심었던 속성 구황곡물입니다.',
    morphology:
      '붉은빛이 감도는 매끈한 속 빈 줄기가 곧게 자라며 삼각형 심장 모양의 잎이 달립니다. 늦여름 가지 끝에 새하얀 작은 꽃들이 소금 뿌린 듯 무리 지어 피고 세모진 검은 씨앗을 맺습니다.',
    reliefHistory:
      '장마나 냉해로 벼와 보리 농사를 망쳤을 때 늦여름에 곧바로 갈아엎고 씨를 뿌려 가을 서리 전에 식량을 거둘 수 있었던 조선의 대표적인 구황 곡식입니다.',
    habitat: {
      category: 'highland',
      zoneName: '메마른 고지대 · 자갈 섞인 척박한 밭',
      soilType: '거름기가 적고 배수가 잘되는 자갈밭·모래땅',
      sunlight: '충분한 햇빛 (과도한 비옥 토양에서는 오히려 쓰러지기 쉬움)',
      moisture: '약건조 지대 선호 (발아 후 70여 일의 짧은 생육 주기)',
      altitude: '해발 300~1,000m의 서늘한 중산간·고원 지대',
      distribution: '강원도 평창 봉평, 제주도 중산간, 전국 산간 밭',
      worldFocusPoint: [11, 2.7, -9],
    },
    nutritionPer100g: {
      caloriesKcal: 343,
      carbsG: 71.5,
      fiberG: 10.0,
      proteinG: 13.3,
      fatG: 3.4,
      keyNutrients: [
        { name: '루틴 (비타민 P)', amount: '고함량', unit: '플라보노이드', dailyPercent: 92, highlight: '모세혈관 강화 및 혈압 강하' },
        { name: '필수아미노산 (라이신)', amount: '13.3', unit: 'g (단백질)', dailyPercent: 26, highlight: '곡물 중 드물게 라이신이 풍부' },
        { name: '마그네슘', amount: '231', unit: 'mg', dailyPercent: 73, highlight: '신경 안정 및 대사 효소 활성' },
        { name: '식이섬유', amount: '10.0', unit: 'g', dailyPercent: 40, highlight: '혈당·콜레스테롤 조절' },
      ],
    },
    benefits: [
      {
        title: '혈관 탄력 및 모세혈관 강화',
        compound: '루틴(Rutin) · 퀘르세틴',
        description:
          '강력한 플라보노이드인 루틴이 약해진 모세혈관을 튼튼하게 하고 혈관 내 노폐물 축적을 막아 심혈관 건강을 지킵니다.',
      },
      {
        title: '고품질 식물성 단백질 보충',
        compound: '라이신(Lysine) · 트립토판',
        description:
          '쌀이나 밀에 부족한 필수아미노산 라이신이 풍부해 흉년기 육류 부족으로 인한 영양 실조를 막아 주었습니다.',
      },
      {
        title: '체내 열독 완화 및 장 운동 촉진',
        compound: '불용성 식이섬유 · 비타민 B군',
        description:
          '서늘한 성질이 몸의 답답한 열기를 식히고 풍부한 식이섬유가 대장 연동 운동을 돕습니다.',
      },
    ],
    preparation:
      '메밀쌀을 볶아 차로 우리거나 껍질을 빻아 메밀묵, 메밀전병, 막국수로 조리하며 무(소화효소)와 함께 먹으면 궁합이 좋습니다.',
    caution:
      '알레르기 유발 가능성이 있는 곡물이므로 메밀 알레르기 이력이 있거나 평소 찬 음식을 먹으면 복통이 잦은 분은 주의가 필요합니다.',
  },
  {
    id: 'sorghum',
    nameKo: '수수',
    hanja: '蜀黍 / 高粱',
    scientificName: 'Sorghum bicolor',
    familyKo: '벼과 (Poaceae)',
    categoryLabel: '내건성 구황곡물 · 붉은 이삭',
    ediblePart: '낟알(수수쌀)',
    seasonLabel: '봄 파종 · 가을 수확 (5~10월)',
    growthDurationSec: 17,
    harvestYield: 5,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '빠름',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: true,
      waterConsumptionPerSec: 0.014,
      sunNeed: 'high',
      optimalSun: 'noon',
      sunlightBonusFactor: 1.4,
      droughtPenaltyFactor: 0.9,
      conditionSummary: '물 1회 + 배수 안정 + 한낮 직사광',
    },
    wildSpawn: {
      allowedSeasons: ['summer', 'autumn'],
      allowedSuns: ['noon'],
      allowedWeathers: ['clear', 'cloudy'],
      spawnChance: 0.4,
      minRespawnSec: 18,
      conditionLabel: '여름·가을(한낮) · 맑음/흐림 (40% 확률)',
    },
    accentHex: '#A83F39',
    foliageHex: '#638A40',
    flowerHex: '#9C3630',
    tuberHex: '#8E322C',
    summary:
      '극심한 가뭄과 척박한 산비탈에서도 2m 넘게 자라며 붉은 이삭을 풍성히 맺는 강인한 오곡입니다.',
    morphology:
      '벼과 한해살이풀로 굵고 단단한 마디 줄기가 곧게 자라며 옥수수와 닮은 넓은 잎이 어긋납니다. 가을철 줄기 꼭대기에 검붉은빛을 띤 커다란 원추꽃차례 이삭이 무겁게 달립니다.',
    reliefHistory:
      '물 대기가 어려운 밭과 화전 지대에서 벼 대신 재배하던 핵심 구황곡식으로, 붉은 수수팥떡과 수수부꾸미로 만들어 기근과 액운을 이겨내는 데 쓰였습니다.',
    habitat: {
      category: 'hillside',
      zoneName: '햇볕이 강하고 배수 좋은 산비탈 밭',
      soilType: '척박한 황토·사질토 및 건조한 밭흙 전반',
      sunlight: '고온과 강한 직사광선을 좋아하는 전형적 양지 작물',
      moisture: '내건성이 매우 뛰어나 적은 강우량으로도 결실',
      altitude: '해발 50~700m의 전국 밭농사 지대',
      distribution: '강원도·충청도·경북 산간 밭 및 전국 구릉지',
      worldFocusPoint: [-10, 1.9, -17],
    },
    nutritionPer100g: {
      caloriesKcal: 339,
      carbsG: 72.1,
      fiberG: 6.7,
      proteinG: 10.6,
      fatG: 3.3,
      keyNutrients: [
        { name: '탄닌 · 안토시아닌', amount: '고함량', unit: '폴리페놀', dailyPercent: 89, highlight: '붉은 껍질 속 강력한 항산화·항염 색소' },
        { name: '프로안토시아니딘', amount: '풍부', unit: '항산화 물질', dailyPercent: 82, highlight: '혈당 조절 및 혈관 노화 억제' },
        { name: '철분', amount: '3.4', unit: 'mg', dailyPercent: 28, highlight: '조혈 작용 및 빈혈 완화' },
        { name: '마그네슘 · 인', amount: '165 / 289', unit: 'mg', dailyPercent: 45, highlight: '근육·신경 및 뼈 대사 지원' },
      ],
    },
    benefits: [
      {
        title: '혈당 상승 억제 및 항당뇨 작용',
        compound: '탄닌(Tannin) · 폴리코사놀',
        description:
          '수수 속 떫은맛 성분인 탄닌과 껍질의 폴리페놀이 당질 소화 효소를 억제해 식후 혈당 급등을 완만하게 낮춥니다.',
      },
      {
        title: '혈중 콜레스테롤 저하',
        compound: '폴리코사놀 · 피토스테롤',
        description:
          '찰수수 껍질에 풍부한 폴리코사놀 성분이 나쁜 LDL 콜레스테롤 수치를 낮추고 혈액 순환을 돕습니다.',
      },
      {
        title: '위장 보온 및 지사 작용',
        compound: '따뜻한 성질 · 수렴성 탄닌',
        description:
          '성질이 따뜻하고 수렴 작용이 있어 속이 냉해 생기는 설사를 멎게 하고 비위를 든든히 합니다.',
      },
    ],
    preparation:
      '잡곡밥에 섞어 짓거나 가루를 내어 수수부꾸미·수수팥떡·수수조청으로 만들며, 겉껍질에 영양분이 몰려 있어 너무 하얗게 도정하지 않는 편이 좋습니다.',
    caution:
      '탄닌 함량이 높아 과다 섭취 시 변비가 생길 수 있으므로 수분이 충분한 채소·국물 요리와 곁들이는 것이 좋습니다.',
  },
  {
    id: 'corn',
    nameKo: '옥수수',
    hanja: '玉蜀黍',
    scientificName: 'Zea mays',
    familyKo: '벼과 (Poaceae)',
    categoryLabel: '산간 대표 구황작물 · 낟알',
    ediblePart: '낟알(열매), 수염(옥수수수염)',
    seasonLabel: '봄 파종 · 여름~초가을 수확 (4~9월)',
    growthDurationSec: 21,
    harvestYield: 5,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '보통',
      waterNeed: 'high',
      requiredWaterings: 2,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.026,
      sunNeed: 'high',
      optimalSun: 'noon',
      sunlightBonusFactor: 1.4,
      droughtPenaltyFactor: 0.68,
      conditionSummary: '물 2회 이상 + 한낮 강한 직사광',
    },
    wildSpawn: {
      allowedSeasons: ['summer'],
      allowedSuns: ['noon'],
      allowedWeathers: ['clear'],
      spawnChance: 0.36,
      minRespawnSec: 22,
      conditionLabel: '여름(한낮) · 맑은 날 (36% 확률)',
    },
    accentHex: '#E0AE38',
    foliageHex: '#4E8738',
    flowerHex: '#F3D267',
    tuberHex: '#E7BA46',
    summary:
      '단위 면적당 열량 생산력이 뛰어나 강원도 화전민과 산간 지역의 굶주림을 해결한 황금빛 구황작물입니다.',
    morphology:
      '굵은 마디를 가진 대나무처럼 단단한 줄기가 2m 안팎으로 자라며 넓은 칼 모양 잎이 달립니다. 줄기 마디에서 자란 굵은 이삭에 껍질과 비단 같은 수염이 나고 촘촘한 알갱이가 여뭅니다.',
    reliefHistory:
      '16세기 말~17세기 초 전래된 뒤 벼농사가 불가능한 산간 경사지에서도 놀라운 수확량을 내며 ‘강냉이밥’과 ‘올챙이국수’로 백성의 한 해 양식을 책임졌습니다.',
    habitat: {
      category: 'highland',
      zoneName: '햇볕 잘 드는 고랭지 · 산간 밭',
      soilType: '유기물이 풍부하고 물 빠짐이 좋은 양토 (pH 6.0~7.0)',
      sunlight: '광합성 효율이 높아 강한 한낮 직사광선 필수',
      moisture: '이삭이 여무는 시기에는 충분한 물 공급이 중요',
      altitude: '해발 100~900m의 산간 경사지 및 평야 밭',
      distribution: '강원도 홍천·정선·영월 및 충북 괴산 대학찰옥수수 지대',
      worldFocusPoint: [14, 2.7, -4],
    },
    nutritionPer100g: {
      caloriesKcal: 106,
      carbsG: 21.0,
      fiberG: 2.7,
      proteinG: 3.3,
      fatG: 1.4,
      keyNutrients: [
        { name: '루테인 · 제아잔틴', amount: '644', unit: 'µg', dailyPercent: 72, highlight: '황반 변성 예방 및 시력 보호' },
        { name: '비타민 E (토코페롤)', amount: '풍부', unit: '씨눈 함유', dailyPercent: 25, highlight: '피부 노화 억제 및 세포 보호' },
        { name: '식이섬유', amount: '2.7', unit: 'g', dailyPercent: 11, highlight: '포만감 유지 및 변비 예방' },
        { name: '엽산 · 비타민 B1', amount: '42', unit: 'µg', dailyPercent: 11, highlight: '에너지 대사 및 적혈구 생성' },
      ],
    },
    benefits: [
      {
        title: '눈 건강 및 시력 보호',
        compound: '루테인(Lutein) · 제아잔틴',
        description:
          '노란 옥수수 알갱이에 풍부한 카로티노이드 색소가 망막의 황반 색소 밀도를 유지해 눈의 피로와 노화를 줄입니다.',
      },
      {
        title: '부종 완화 및 신장 배뇨 지원',
        compound: '옥수수수염(옥미수) · 칼륨 · 플라보노이드',
        description:
          '예로부터 말린 옥수수수염을 달여 마셔 체내 노폐물 배출과 부종 가라앉힘에 활용했습니다.',
      },
      {
        title: '에너지 공급 및 치아·잇몸 보조',
        compound: '복합 탄수화물 · 베타시토스테롤',
        description:
          '속대에 함유된 베타시토스테롤 성분은 잇몸 염증 완화와 구강 건강 보조에 쓰입니다.',
      },
    ],
    preparation:
      '껍질 한두 겹을 남긴 채 찜통에 찌면 수분과 단맛이 보존됩니다. 말린 알갱이를 빻아 강냉이죽·올챙이국수·옥수수범벅으로 만듭니다.',
    caution:
      '필수아미노산 중 트립토판과 나이아신 흡수율이 낮으므로 옥수수만 단독 주식으로 장복하지 말고 콩·우유·채소와 함께 드세요.',
  },
  {
    id: 'barley',
    nameKo: '보리',
    hanja: '大麥',
    scientificName: 'Hordeum vulgare',
    familyKo: '벼과 (Poaceae)',
    categoryLabel: '춘궁기 극복 곡물 · 맥류',
    ediblePart: '낟알(보리쌀), 새싹(새싹보리)',
    seasonLabel: '가을 파종 · 이른 여름 수확 (10~6월)',
    growthDurationSec: 15,
    harvestYield: 5,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '빠름',
      waterNeed: 'medium',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.016,
      sunNeed: 'medium',
      optimalSun: 'morning',
      sunlightBonusFactor: 1.3,
      droughtPenaltyFactor: 0.85,
      conditionSummary: '물 1회 이상 + 아침 햇살',
    },
    wildSpawn: {
      allowedSeasons: ['spring', 'summer', 'winter'],
      allowedSuns: ['morning', 'noon'],
      allowedWeathers: ['clear', 'cloudy', 'snow'],
      spawnChance: 0.5,
      minRespawnSec: 16,
      conditionLabel: '겨울·봄·여름 · 맑음/흐림/눈 (50% 확률)',
    },
    accentHex: '#C29B4B',
    foliageHex: '#6F9942',
    flowerHex: '#E0C06B',
    tuberHex: '#C8AE74',
    summary:
      '추운 겨울을 땅속에서 이겨낸 뒤 가장 먼저 여물어 ‘보릿고개’를 넘게 해 주던 고마운 곡식입니다.',
    morphology:
      '가을에 싹을 틔워 겨울을 난 뒤 봄철 줄기가 곧게 올라오며, 이삭에 긴 까끄라기(수염)가 촘촘히 돋아 황금빛 물결을 이룹니다.',
    reliefHistory:
      '묵은 곡식이 떨어지는 봄철(춘궁기)을 버티고 5~6월경 햇보리를 수확해 굶주림을 끝내는 데 결정적 역할을 하여 ‘보릿고개’라는 말의 주인공이 되었습니다.',
    habitat: {
      category: 'meadow',
      zoneName: '햇볕 들고 바람 통하는 들판 · 논이모작 밭',
      soilType: '배수가 잘되는 양토 및 사질양토 (습해에 약함)',
      sunlight: '서늘한 봄~초여름 햇빛과 충분한 통풍',
      moisture: '적습 유지 (과습한 논에서는 배수로 확보 필수)',
      altitude: '해발 10~600m의 남부 평야 및 들판 지대',
      distribution: '전북 고창·전남 영광·제주를 비롯한 전국 들판',
      worldFocusPoint: [7, 1.3, 15],
    },
    nutritionPer100g: {
      caloriesKcal: 352,
      carbsG: 77.7,
      fiberG: 15.6,
      proteinG: 9.9,
      fatG: 1.2,
      keyNutrients: [
        { name: '베타글루칸 (수용성 식이섬유)', amount: '4.5~6.0', unit: 'g', dailyPercent: 94, highlight: '콜레스테롤 배출 및 혈당 급등 차단' },
        { name: '총 식이섬유', amount: '15.6', unit: 'g', dailyPercent: 62, highlight: '백미의 10배 이상 풍부' },
        { name: '칼륨 · 셀레늄', amount: '280', unit: 'mg', dailyPercent: 18, highlight: '체내 나트륨 배출 및 항산화' },
        { name: '비타민 B1 · B2', amount: '0.28', unit: 'mg', dailyPercent: 22, highlight: '각기병 예방 및 피로 대사' },
      ],
    },
    benefits: [
      {
        title: '혈중 지질 개선 및 장 건강',
        compound: '베타글루칸(β-Glucan)',
        description:
          '수용성 식이섬유인 베타글루칸이 담즙산과 콜레스테롤을 흡착해 체외로 배출하고 장내 유익균의 증식을 돕습니다.',
      },
      {
        title: '식후 혈당 스파이크 완화',
        compound: '저혈당지수(GI) 복합 탄수화물',
        description:
          '소화·흡수가 천천히 이루어져 백미보다 혈당이 완만하게 오르며 오랫동안 포만감을 유지합니다.',
      },
      {
        title: '소화 촉진 및 체내 열감 진정',
        compound: '맥아 효소(아밀라아제) · 폴리페놀',
        description:
          '보리를 싹틔운 엿기름(맥아)은 예로부터 천연 소화제와 식혜 재료로 널리 쓰였습니다.',
      },
    ],
    preparation:
      '압맥이나 찰보리로 2시간 이상 불린 뒤 쌀과 3:7 비율로 섞어 보리밥을 짓거나, 보리개떡·보리차·엿기름으로 활용합니다.',
    caution:
      '성질이 서늘하고 식이섬유가 매우 많아 평소 장이 예민하고 설사가 잦은 경우 잘 불려 푹 익혀 소량씩 드세요.',
  },
  {
    id: 'pumpkin',
    nameKo: '늙은호박',
    hanja: '南瓜',
    scientificName: 'Cucurbita moschata',
    familyKo: '박과 (Cucurbitaceae)',
    categoryLabel: '덩굴 열매 구황작물 · 열매',
    ediblePart: '열매(과육), 어린 잎(호박잎), 씨앗',
    seasonLabel: '봄 파종 · 가을 수확 (5~10월)',
    growthDurationSec: 25,
    harvestYield: 3,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '느림',
      waterNeed: 'high',
      requiredWaterings: 2,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.024,
      sunNeed: 'high',
      optimalSun: 'noon',
      sunlightBonusFactor: 1.35,
      droughtPenaltyFactor: 0.72,
      conditionSummary: '물 2회 이상 + 한낮 직사광',
    },
    wildSpawn: {
      allowedSeasons: ['summer', 'autumn'],
      allowedSuns: ['noon', 'sunset'],
      allowedWeathers: ['clear', 'rain'],
      spawnChance: 0.35,
      minRespawnSec: 24,
      conditionLabel: '여름·가을 · 맑음/비 (35% 확률)',
    },
    accentHex: '#D97B29',
    foliageHex: '#477F3A',
    flowerHex: '#F4B933',
    tuberHex: '#D87E26',
    summary:
      '울타리나 밭둑 한 구석에서도 큼직한 열매를 맺어 겨울철 구황죽과 범벅으로 배를 채워준 열매작물입니다.',
    morphology:
      '굵고 털이 많은 덩굴줄기가 넓게 뻗으며 큰 다섯 갈래 잎과 커다란 노란 깔때기 모양의 꽃이 핍니다. 성숙하면 단단한 골이 진 황갈색 둥근 열매를 맺습니다.',
    reliefHistory:
      '따로 비옥한 논밭을 차지하지 않고 담장 밑이나 퇴비 더미 옆에 심어도 덩굴마다 큰 열매가 달려, 곡식이 부족할 때 썰어 말린 호박고지나 호박죽으로 겨울을 났습니다.',
    habitat: {
      category: 'meadow',
      zoneName: '거름기 있고 햇볕 잘 드는 밭둑 · 농가 울타리',
      soilType: '유기질과 퇴비가 풍부하고 배수가 잘되는 양토',
      sunlight: '풍부한 햇빛이 드는 양지 (잎이 커서 볕이 잘 들어야 함)',
      moisture: '열매가 커지는 시기에는 충분한 수분 필요',
      altitude: '해발 10~600m 전국의 농촌 밭둑과 마당 가장자리',
      distribution: '전국 농촌 텃밭 및 밭 가장자리 전역',
      worldFocusPoint: [4, 1.2, 16],
    },
    nutritionPer100g: {
      caloriesKcal: 27,
      carbsG: 7.0,
      fiberG: 1.5,
      proteinG: 1.0,
      fatG: 0.1,
      keyNutrients: [
        { name: '베타카로틴', amount: '2,100', unit: 'µg RAE', dailyPercent: 98, highlight: '짙은 주황색 과육의 핵심 항산화 성분' },
        { name: '칼륨', amount: '264', unit: 'mg', dailyPercent: 8, highlight: '체내 노폐물 및 부기 배출' },
        { name: '비타민 C', amount: '12', unit: 'mg', dailyPercent: 12, highlight: '피부 탄력 및 점막 보호' },
        { name: '아연 (호박씨)', amount: '7.8', unit: 'mg (씨앗 100g)', dailyPercent: 78, highlight: '면역 및 전립선·모발 건강' },
      ],
    },
    benefits: [
      {
        title: '산후 및 전신 부종 완화',
        compound: '칼륨 · 펙틴 · 시트룰린',
        description:
          '이뇨 작용을 돕고 체내 불필요한 수분과 나트륨 배출을 촉진해 예로부터 부기 빼는 음식의 대명사로 꼽혔습니다.',
      },
      {
        title: '점막 면역 및 눈 건강',
        compound: '고함량 베타카로틴',
        description:
          '풍부한 베타카로틴이 체내에서 비타민 A로 전환되어 호흡기 점막과 피부 장벽을 튼튼히 합니다.',
      },
      {
        title: '위장 부담이 적은 회복식',
        compound: '수용성 펙틴 · 천연 당분',
        description:
          '부드럽게 익혀 먹으면 소화가 매우 잘되어 굶주림이나 병후 회복기에 속을 달래는 죽으로 좋습니다.',
      },
    ],
    preparation:
      '속을 파낸 뒤 찹쌀·팥과 함께 호박죽으로 끓이거나, 얇게 썰어 말린 호박고지를 겨울철 찌개·나물로 볶아 먹습니다. 씨앗도 볶아 섭취합니다.',
    caution:
      '칼륨 함량이 있으므로 만성 신장 질환자는 과다 섭취를 피하고, 즙 형태로 너무 진하게 장복하지 않도록 주의하세요.',
  },
  {
    id: 'doraji',
    nameKo: '도라지',
    hanja: '桔梗',
    scientificName: 'Platycodon grandiflorus',
    familyKo: '초롱꽃과 (Campanulaceae)',
    categoryLabel: '산야초 · 약용 뿌리작물',
    ediblePart: '뿌리(길경), 어린 순',
    seasonLabel: '봄·가을 채집 · 개화 7~8월',
    growthDurationSec: 27,
    harvestYield: 3,
    seedYield: 2,
    cultivation: {
      growthRateLabel: '느림',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: true,
      waterConsumptionPerSec: 0.015,
      sunNeed: 'medium',
      optimalSun: 'morning',
      sunlightBonusFactor: 1.25,
      droughtPenaltyFactor: 0.85,
      conditionSummary: '물 1회 + 배수 안정 + 아침 햇살',
    },
    wildSpawn: {
      allowedSeasons: ['spring', 'summer', 'autumn'],
      allowedSuns: ['morning', 'sunset'],
      allowedWeathers: ['rain'],
      spawnChance: 0.28,
      minRespawnSec: 26,
      conditionLabel: '봄~가을 · 비 오는 날 (28% 확률)',
    },
    accentHex: '#6F58C9',
    foliageHex: '#437A55',
    flowerHex: '#7A68E2',
    tuberHex: '#E5DCC5',
    summary:
      '산기슭 양지에서 자라며 흉년기 반찬과 호흡기 질환 치료약으로 귀하게 쓰인 여러해살이풀입니다.',
    morphology:
      '굵고 흰 도라지 뿌리가 곧게 내리며, 줄기를 자르면 하얀 즙액이 나옵니다. 긴 타원형 잎 가장자리에 톱니가 있고, 여름철 종 모양의 청보라색 또는 흰색 꽃이 핍니다.',
    reliefHistory:
      '『동의보감』과 『구황촬요』에 기록된 산나물이자 구황 식재료로, 소금물에 우려 아린 맛을 뺀 뒤 데쳐 먹거나 말려 두어 겨울철 식량으로 비축했습니다.',
    habitat: {
      category: 'hillside',
      zoneName: '햇볕 잘 드는 산기슭 풀밭 · 능선 초지',
      soilType: '물 빠짐이 좋은 모래 섞인 부식토 (깊이 갈아엎은 토양)',
      sunlight: '반양지~양지 (개활지 산기슭에서 뿌리가 굵게 자람)',
      moisture: '배수가 필수적이며 습해에 약함',
      altitude: '해발 100~900m 전국 산과 들의 풀밭',
      distribution: '한반도 전역 산기슭, 임도 주변, 양지바른 묵밭',
      worldFocusPoint: [-11, 2.4, -14],
    },
    nutritionPer100g: {
      caloriesKcal: 86,
      carbsG: 18.7,
      fiberG: 4.5,
      proteinG: 2.4,
      fatG: 0.2,
      keyNutrients: [
        { name: '플라티코딘 D (사포닌)', amount: '풍부', unit: '활성배당체', dailyPercent: 85, highlight: '기관지 점액 분비 및 거담 작용' },
        { name: '식이섬유', amount: '4.5', unit: 'g', dailyPercent: 18, highlight: '장내 노폐물 흡착 배출' },
        { name: '칼슘', amount: '47', unit: 'mg', dailyPercent: 7, highlight: '골격 형성 지원' },
        { name: '철분', amount: '1.3', unit: 'mg', dailyPercent: 11, highlight: '산소 운반 보조' },
      ],
    },
    benefits: [
      {
        title: '호흡기·기관지 점막 보호',
        compound: '사포닌 (Platycodin D)',
        description:
          '도라지 특유의 쌉싸름한 사포닌 성분이 기관지 점액 분비를 촉진해 가래를 삭이고 기침 및 인후염 완화에 도움을 줍니다.',
      },
      {
        title: '항염 및 면역 조절',
        compound: '이눌린 · 폴리페놀',
        description:
          '체내 염증 반응을 억제하고 면역을 활성화해 환절기 감기와 호흡기 부담을 줄여줍니다.',
      },
      {
        title: '혈당 및 지질 대사 보조',
        compound: '수용성 식이섬유 · 피토스테롤',
        description:
          '풍부한 식이섬유와 사포닌이 콜레스테롤 흡수를 억제하고 혈관 건강 유지에 기여합니다.',
      },
    ],
    preparation:
      '껍질을 벗겨 굵은 소금으로 주물러 씻은 뒤 찬물에 잠시 담가 쓴맛을 조절하고 생채·볶음으로 조리합니다. 약용 시 껍질째 말려 달여 마십니다.',
    caution:
      '사포닌 성분이 위 점막을 자극할 수 있으므로 위궤양이 있는 경우 생도라지 과다 섭취를 피하고 익혀서 드세요.',
  },
  {
    id: 'kudzu',
    nameKo: '칡',
    hanja: '葛',
    scientificName: 'Pueraria montana',
    familyKo: '콩과 (Fabaceae)',
    categoryLabel: '산악 구황작물 · 덩굴성 뿌리',
    ediblePart: '뿌리(갈근), 어린 싹, 꽃(갈화)',
    seasonLabel: '늦가을~이른 봄 뿌리 채취',
    growthDurationSec: 29,
    harvestYield: 3,
    seedYield: 2,
    cultivation: {
      growthRateLabel: '느림',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: true,
      waterConsumptionPerSec: 0.013,
      sunNeed: 'high',
      optimalSun: 'noon',
      sunlightBonusFactor: 1.3,
      droughtPenaltyFactor: 0.94,
      conditionSummary: '물 1회 + 배수 안정 + 한낮 직사광',
    },
    wildSpawn: {
      allowedSeasons: ['autumn', 'winter'],
      allowedSuns: ['morning', 'noon', 'sunset', 'night'],
      allowedWeathers: ['cloudy', 'rain', 'snow'],
      spawnChance: 0.26,
      minRespawnSec: 28,
      conditionLabel: '가을·겨울 · 흐림/비/눈 (26% 확률)',
    },
    accentHex: '#8E6244',
    foliageHex: '#4F7A38',
    flowerHex: '#9C5B9E',
    tuberHex: '#7A5438',
    summary:
      '기근 시 굵은 뿌리에서 귀한 녹말(갈분)을 얻어 연명하게 해 준 생명력 강한 덩굴식물입니다.',
    morphology:
      '굵고 긴 목질 덩굴이 다른 나무나 바위를 감고 올라가며 자랍니다. 잎은 세 개의 작은 잎으로 이루어진 겹잎이며, 늦여름 짙은 자주색 꽃송이가 이삭 모양으로 핍니다.',
    reliefHistory:
      '조선 시대 흉년마다 백성들이 산에서 칡뿌리를 캐어 절구로 찧고 물에 가라앉혀 만든 ‘갈분(葛粉)’으로 죽과 떡을 쑤어 먹던 핵심 구황 식물입니다.',
    habitat: {
      category: 'hillside',
      zoneName: '산비탈 양지 · 바위 틈 덤불 지대',
      soilType: '척박한 자갈흙·황토에서도 뿌리를 깊이 내려 자생',
      sunlight: '햇빛을 매우 좋아하는 극양수 식물',
      moisture: '강한 내건성을 지녀 건조한 산비탈에서도 번성',
      altitude: '해발 50~1,000m 산비탈·계곡 사면·도로변 절개지',
      distribution: '전국 산야의 양지바른 비탈과 숲 가장자리',
      worldFocusPoint: [-16, 2.8, -5],
    },
    nutritionPer100g: {
      caloriesKcal: 116,
      carbsG: 26.5,
      fiberG: 5.2,
      proteinG: 2.1,
      fatG: 0.1,
      keyNutrients: [
        { name: '푸에라린 (이소플라본)', amount: '고함량', unit: '식물성 에스트로겐', dailyPercent: 88, highlight: '혈류 개선 및 갱년기 증상 완화' },
        { name: '다이드제인', amount: '풍부', unit: '이소플라본', dailyPercent: 72, highlight: '숙취 해소 및 간 보호' },
        { name: '식이섬유', amount: '5.2', unit: 'g', dailyPercent: 21, highlight: '탄수화물 흡수 속도 조절' },
        { name: '칼슘', amount: '62', unit: 'mg', dailyPercent: 9, highlight: '골밀도 유지 지원' },
      ],
    },
    benefits: [
      {
        title: '간 기능 보호 및 숙취 해소',
        compound: '다이드제인(Daidzein) · 푸에라린',
        description:
          '알코올 분해 효소 활성을 돕고 아세트알데히드 배출을 촉진해 예로부터 칡즙과 갈화가 주독 해소에 쓰였습니다.',
      },
      {
        title: '혈액 순환 및 열감 완화',
        compound: '이소플라본 · 카테킨',
        description:
          '말초 혈관을 확장해 두통·어깨 결림을 완화하고 여성 호르몬 유사 작용으로 안면 홍조 완화에 도움을 줍니다.',
      },
      {
        title: '열을 내리고 갈증 해소',
        compound: '전분 · 천연 미네랄',
        description:
          '한의학에서 갈근은 성질이 서늘해 발열과 갈증을 잦아들게 하는 약재로 널리 활용됩니다.',
      },
    ],
    preparation:
      '채취한 뿌리를 깨끗이 씻어 썰어 말린 뒤 차로 달여 마시거나, 생칡을 압착해 칡즙·갈분(칡녹말)을 내어 국수나 묵으로 만듭니다.',
    caution:
      '성질이 차가우므로 몸이 냉하고 설사가 잦은 사람이나 임산부·에스트로겐 민감 질환자는 장기 과다 복용을 피해야 합니다.',
  },
  {
    id: 'yam',
    nameKo: '마 (산약)',
    hanja: '山藥',
    scientificName: 'Dioscorea polystachya',
    familyKo: '마과 (Dioscoreaceae)',
    categoryLabel: '숲 가장자리 구황작물 · 덩이뿌리',
    ediblePart: '덩이뿌리, 주아(영여자)',
    seasonLabel: '가을~초겨울 채취 (10~12월)',
    growthDurationSec: 26,
    harvestYield: 3,
    seedYield: 2,
    cultivation: {
      growthRateLabel: '느림',
      waterNeed: 'medium',
      requiredWaterings: 2,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.018,
      sunNeed: 'low',
      optimalSun: 'sunset',
      sunlightBonusFactor: 1.3,
      droughtPenaltyFactor: 0.78,
      conditionSummary: '물 2회 이상 + 노을 반음지',
    },
    wildSpawn: {
      allowedSeasons: ['autumn', 'winter'],
      allowedSuns: ['sunset', 'night'],
      allowedWeathers: ['cloudy', 'rain', 'snow'],
      spawnChance: 0.3,
      minRespawnSec: 25,
      conditionLabel: '가을·겨울 · 노을/밤 · 흐림/비/눈 (30% 확률)',
    },
    accentHex: '#A68859',
    foliageHex: '#356E42',
    flowerHex: '#E5E0B5',
    tuberHex: '#D8C7A6',
    summary:
      '‘산에서 나는 장어’라 불리며 굶주린 이의 원기를 단번에 북돋아 주던 점액질 풍부한 산약(山藥)입니다.',
    morphology:
      '덩굴줄기가 오른쪽으로 감아 올라가며 자라고 잎은 심장 모양으로 마주납니다. 잎겨드랑이에 콩알만 한 주아(영여자)가 달리며 땅속에 길쭉한 원통형 덩이뿌리가 자랍니다.',
    reliefHistory:
      '흉년에 산에서 캐어 쪄 먹거나 죽으로 쑤어 먹었으며, 영양 밀도가 높고 소화가 잘되어 노약자와 허약자의 보양 구황식으로 대접받았습니다.',
    habitat: {
      category: 'streamside',
      zoneName: '비옥한 산골짜기 · 숲 가장자리 반음지',
      soilType: '유기물이 풍부하고 깊이 30cm 이상 부드러운 양토',
      sunlight: '반양지~반음지 (줄기는 햇빛을 받되 뿌리는 서늘한 곳)',
      moisture: '적당한 습윤 유지 (지표면이 마르지 않는 계곡 부근)',
      altitude: '해발 100~700m 산록 계곡과 관목 숲 가장자리',
      distribution: '경북 안동·전국 산골짜기 숲길 및 덤불 주변',
      worldFocusPoint: [-13, 1.5, 11],
    },
    nutritionPer100g: {
      caloriesKcal: 118,
      carbsG: 27.9,
      fiberG: 4.1,
      proteinG: 1.5,
      fatG: 0.2,
      keyNutrients: [
        { name: '뮤신 (당단백질)', amount: '풍부', unit: '끈적한 점액질', dailyPercent: 80, highlight: '위벽 보호 및 단백질 흡수 촉진' },
        { name: '디아스타제 (아밀라아제)', amount: '활성 효소', unit: '소화효소', dailyPercent: 75, highlight: '탄수화물 소화 촉진' },
        { name: '칼륨', amount: '816', unit: 'mg', dailyPercent: 23, highlight: '높은 전해질·나트륨 배출 작용' },
        { name: '비타민 B1', amount: '0.11', unit: 'mg', dailyPercent: 9, highlight: '당질 에너지 대사' },
      ],
    },
    benefits: [
      {
        title: '위장 보호 및 소화력 증진',
        compound: '뮤신(Mucin) · 디아스타제',
        description:
          '마를 갈면 나오는 끈적한 뮤신 성분이 위 점막을 부드럽게 코팅해 속 쓰림을 줄여주고, 천연 소화효소가 소화를 돕습니다.',
      },
      {
        title: '원기 회복 및 혈당 조절',
        compound: '디오스게닌 · 사포닌 · 아르기닌',
        description:
          '체력 소모가 클 때 빠른 에너지원으로 작용하면서도 점액질이 급격한 혈당 스파이크를 완만하게 억제합니다.',
      },
      {
        title: '인슐린 감수성 및 혈관 건강',
        compound: '고함량 칼륨 · 콜린',
        description:
          '매우 높은 칼륨 함량이 혈압 조절을 돕고 세포 노화를 완화합니다.',
      },
    ],
    preparation:
      '생마의 효소와 뮤신을 온전히 섭취하려면 강판에 갈아 생으로 마시거나 우유·꿀과 갈아 마시고, 쪄 먹거나 죽으로 끓여도 좋습니다.',
    caution:
      '껍질을 벗길 때 옥살산칼슘 결정이 피부에 가려움을 유발할 수 있으므로 장갑을 끼고 손질하는 것이 안전합니다.',
  },
  {
    id: 'millet',
    nameKo: '조 (좁쌀)',
    hanja: '粟',
    scientificName: 'Setaria italica',
    familyKo: '벼과 (Poaceae)',
    categoryLabel: '내건성 구황곡물 · 낟알',
    ediblePart: '낟알(좁쌀)',
    seasonLabel: '봄 파종 · 가을 수확 (5~9월)',
    growthDurationSec: 16,
    harvestYield: 5,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '빠름',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: true,
      waterConsumptionPerSec: 0.014,
      sunNeed: 'high',
      optimalSun: 'noon',
      sunlightBonusFactor: 1.35,
      droughtPenaltyFactor: 0.92,
      conditionSummary: '물 1회 + 배수 안정 + 한낮 직사광',
    },
    wildSpawn: {
      allowedSeasons: ['summer', 'autumn'],
      allowedSuns: ['noon'],
      allowedWeathers: ['clear'],
      spawnChance: 0.38,
      minRespawnSec: 18,
      conditionLabel: '여름·가을(한낮) · 맑은 날 (38% 확률)',
    },
    accentHex: '#D49E32',
    foliageHex: '#7A963E',
    flowerHex: '#E8BC52',
    tuberHex: '#E0B446',
    summary:
      '가뭄에 가장 강하고 비옥하지 않은 돌밭에서도 황금빛 이삭을 맺는 한민족의 오래된 오곡입니다.',
    morphology:
      '벼과 한해살이풀로 줄기가 1m 내외로 곧게 자라며 긴 칼 모양의 잎이 어긋납니다. 가을이 되면 줄기 끝에 촘촘한 원통형 노란 이삭이 고개를 숙이며 주렁주렁 달립니다.',
    reliefHistory:
      '물 대기가 힘든 산비탈 밭이나 극심한 가뭄 시 벼를 대신해 경작한 일등 구황곡물이며, 껍질째 오래 저장할 수 있어 비상식량 창고(환곡)의 핵심 곡식이었습니다.',
    habitat: {
      category: 'highland',
      zoneName: '건조하고 바람 통하는 산간 밭 · 황토 구릉',
      soilType: '물이 고이지 않는 건조한 사질토 및 돌밭',
      sunlight: '풍부한 일조량과 건조한 대기 환경',
      moisture: '강우량이 적은 가뭄 환경에서도 생육이 탁월함',
      altitude: '해발 50~800m의 밭농사 지대 및 제주 화산회토',
      distribution: '제주도·강원도·충북 등 밭작물 지대 전역',
      worldFocusPoint: [16, 2.5, -6],
    },
    nutritionPer100g: {
      caloriesKcal: 364,
      carbsG: 72.8,
      fiberG: 3.9,
      proteinG: 11.2,
      fatG: 4.2,
      keyNutrients: [
        { name: '비타민 B1 (티아민)', amount: '0.42', unit: 'mg', dailyPercent: 35, highlight: '백미보다 4배 이상 높은 신경·피로 비타민' },
        { name: '철분', amount: '3.0', unit: 'mg', dailyPercent: 25, highlight: '빈혈 예방 및 조혈 지원' },
        { name: '아연', amount: '2.4', unit: 'mg', dailyPercent: 24, highlight: '면역세포 활성 및 성장 발육' },
        { name: '인 · 마그네슘', amount: '285', unit: 'mg', dailyPercent: 40, highlight: '에너지 대사 및 뼈 건강' },
      ],
    },
    benefits: [
      {
        title: '소화기 강화 및 비위 보양',
        compound: '수용성 단백질 · 비타민 B군',
        description:
          '입자가 작고 소화가 잘되어 굶주림 끝에 약해진 위장을 무리 없이 달래주는 조밥·좁쌀미음으로 애용되었습니다.',
      },
      {
        title: '빈혈 예방 및 피로 해소',
        compound: '철분 · 티아민(B1) · 나이아신',
        description:
          '정제된 백미에 부족하기 쉬운 비타민 B1과 철분이 풍부해 각기병 예방과 에너지 대사 활성에 좋습니다.',
      },
      {
        title: '항산화 및 혈관 보호',
        compound: '페놀산 · 카로티노이드(황색소)',
        description:
          '차조와 메조의 노란 껍질 색소가 체내 산화 스트레스를 낮춰줍니다.',
      },
    ],
    preparation:
      '백미에 20~30% 섞어 조밥을 짓거나, 껍질을 찧어 차조 떡·좁쌀죽·식혜로 만들어 소화가 약한 아이와 노인식으로 활용합니다.',
    caution:
      '도정이 덜 된 생좁쌀은 충분히 불려서 푹 익혀야 소화가 잘되며, 습기에 약하므로 서늘하고 건조한 곳에 밀봉 보관하세요.',
  },
  {
    id: 'shepherds_purse',
    nameKo: '냉이',
    hanja: '薺',
    scientificName: 'Capsella bursa-pastoris',
    familyKo: '배추과 (Brassicaceae)',
    categoryLabel: '봄철 구황 산야초 · 로제트 풀',
    ediblePart: '뿌리째 어린 전초',
    seasonLabel: '이른 봄 채집 (2~4월)',
    growthDurationSec: 12,
    harvestYield: 4,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '빠름',
      waterNeed: 'medium',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.017,
      sunNeed: 'low',
      optimalSun: 'morning',
      sunlightBonusFactor: 1.3,
      droughtPenaltyFactor: 0.78,
      conditionSummary: '물 1회 이상 + 이른 아침 햇살',
    },
    wildSpawn: {
      allowedSeasons: ['spring', 'winter'],
      allowedSuns: ['morning', 'noon'],
      allowedWeathers: ['clear', 'cloudy', 'snow'],
      spawnChance: 0.55,
      minRespawnSec: 14,
      conditionLabel: '겨울·봄 · 맑음/흐림/눈 (55% 확률)',
    },
    accentHex: '#59A35B',
    foliageHex: '#4B8B46',
    flowerHex: '#FFFFFF',
    tuberHex: '#E8DFC8',
    summary:
      '겨울을 버텨낸 뒤 가장 먼저 밭둑에 돋아 보릿고개의 단백질과 비타민을 채워준 향긋한 봄나물입니다.',
    morphology:
      '뿌리잎이 땅바닥에 방석처럼(로제트) 퍼져 겨울을 나고, 봄이 되면 20~40cm 꽃대가 올라와 자잘한 흰 꽃이 피며 하트(삼각형) 모양의 앙증맞은 열매를 맺습니다.',
    reliefHistory:
      '겨울 저장 식량이 바닥나고 햇보리가 익기 전인 춘궁기(보릿고개)에 아낙네들이 바구니를 들고 논둑·밭둑에서 캐어 된장국과 나물로 끓여 먹던 봄철 구황나물 1호입니다.',
    habitat: {
      category: 'meadow',
      zoneName: '양지바른 들판 · 논둑과 밭 가장자리',
      soilType: '배수가 적당하고 햇빛이 잘 드는 보통 밭흙·들판 흙',
      sunlight: '따뜻한 봄 햇살이 드는 개활지',
      moisture: '적습한 봄철 토양 (가을에 발아해 겨울을 남)',
      altitude: '해발 10~600m 저지대 들판, 과수원, 밭둑',
      distribution: '전국 농촌 들녘과 양지바른 풀밭 전역',
      worldFocusPoint: [6, 1.3, 12],
    },
    nutritionPer100g: {
      caloriesKcal: 34,
      carbsG: 4.9,
      fiberG: 2.8,
      proteinG: 4.2,
      fatG: 0.4,
      keyNutrients: [
        { name: '단백질 (채소 중 최상위)', amount: '4.2', unit: 'g', dailyPercent: 8, highlight: '봄나물 중 단백질 함량이 매우 높음' },
        { name: '비타민 A (베타카로틴)', amount: '405', unit: 'µg RAE', dailyPercent: 58, highlight: '눈의 피로 및 점막 보호' },
        { name: '비타민 C', amount: '52', unit: 'mg', dailyPercent: 52, highlight: '춘곤증 해소 및 항산화' },
        { name: '칼슘 · 콜린', amount: '165', unit: 'mg', dailyPercent: 24, highlight: '간 지방 축적 억제 및 뼈 건강' },
      ],
    },
    benefits: [
      {
        title: '간 해독 및 춘곤증 완화',
        compound: '콜린(Choline) · 메티오닌 · 비타민 C',
        description:
          '간에 지방이 쌓이는 것을 막아주는 콜린과 비타민이 풍부해 봄철 피로 해소와 숙취·간 건강 관리에 유익합니다.',
      },
      {
        title: '눈 건강 및 항염 작용',
        compound: '베타카로틴 · 아연 · 퀘르세틴',
        description:
          '눈의 충혈을 가라앉히고 망막 세포를 보호하는 비타민 A 전구체가 다량 함유되어 있습니다.',
      },
      {
        title: '지혈 및 비위 기능 개선',
        compound: '푸마르산 · 칼륨',
        description:
          '『동의보감』에서 냉이는 간을 돕고 눈을 밝게 하며 소화기를 튼튼히 하는 나물로 기록되어 있습니다.',
      },
    ],
    preparation:
      '꽃대가 올라오기 전 뿌리째 캐어 흙을 깨끗이 씻은 뒤, 된장국에 넣어 끓이거나 살짝 데쳐 된장·고추장으로 무쳐 먹습니다.',
    caution:
      '꽃이 피고 줄기가 억세지면 맛이 떨어지고 질겨지므로 이른 봄 어린잎일 때 채취하며, 칼륨이 많아 신장 질환자는 데친 물을 버리고 섭취하세요.',
  },
  {
    id: 'mugwort',
    nameKo: '쑥',
    hanja: '艾',
    scientificName: 'Artemisia princeps',
    familyKo: '국화과 (Asteraceae)',
    categoryLabel: '야생 구황·약용 식물 · 잎',
    ediblePart: '어린 순과 잎',
    seasonLabel: '봄(3~5월) 식용 · 단오 무렵 약용 채취',
    growthDurationSec: 14,
    harvestYield: 4,
    seedYield: 3,
    cultivation: {
      growthRateLabel: '빠름',
      waterNeed: 'low',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.013,
      sunNeed: 'medium',
      optimalSun: 'sunset',
      sunlightBonusFactor: 1.25,
      droughtPenaltyFactor: 0.9,
      conditionSummary: '물 1회 이상 + 노을 햇살',
    },
    wildSpawn: {
      allowedSeasons: ['spring', 'autumn'],
      allowedSuns: ['morning', 'sunset'],
      allowedWeathers: ['cloudy', 'rain'],
      spawnChance: 0.45,
      minRespawnSec: 16,
      conditionLabel: '봄·가을 · 흐림/비 (45% 확률)',
    },
    accentHex: '#3D7A5E',
    foliageHex: '#4E7D5B',
    flowerHex: '#C9C489',
    tuberHex: '#5C4E3C',
    summary:
      '진한 향기와 따뜻한 성질을 지녀 보릿고개에 쑥버무리와 쑥떡으로 허기를 달래준 강인한 들풀입니다.',
    morphology:
      '땅속줄기가 옆으로 길게 뻗으며 무리 지어 자랍니다. 잎은 깃꼴로 깊게 갈라지고 앞면은 짙은 녹색, 뒷면에는 하얀 솜털이 빽빽하게 덮여 은빛을 띱니다.',
    reliefHistory:
      '어린 쑥에 적은 양의 쌀가루나 보릿가루를 버무려 쪄낸 ‘쑥버무리’와 ‘쑥개떡’은 적은 곡식으로 포만감을 크게 늘려주던 대표적인 춘궁기 구황 음식이었습니다.',
    habitat: {
      category: 'meadow',
      zoneName: '들판과 길가 · 개울가 양지 초지',
      soilType: '토질을 가리지 않고 척박한 들판에서도 강하게 번식',
      sunlight: '양지 (햇볕을 받을수록 향유 성분인 치네올이 짙어짐)',
      moisture: '적습~약건조까지 환경 적응력이 매우 뛰어남',
      altitude: '해발 0~1,200m 전국의 들판, 둑길, 해안가',
      distribution: '강화도 약쑥·남해 해풍쑥을 비롯한 전국 들판 전역',
      worldFocusPoint: [11, 1.4, 8],
    },
    nutritionPer100g: {
      caloriesKcal: 26,
      carbsG: 4.5,
      fiberG: 3.7,
      proteinG: 3.3,
      fatG: 0.5,
      keyNutrients: [
        { name: '치네올 (정유 성분)', amount: '풍부', unit: '향기 성분', dailyPercent: 85, highlight: '체온 상승 및 항균·소화 촉진' },
        { name: '베타카로틴', amount: '1,350', unit: 'µg RAE', dailyPercent: 98, highlight: '강력한 항산화 및 노화 억제' },
        { name: '엽록소 (클로로필)', amount: '고함량', unit: '식물 색소', dailyPercent: 78, highlight: '혈액 정화 및 세포 재생' },
        { name: '비타민 C · 칼슘', amount: '41 / 93', unit: 'mg', dailyPercent: 41, highlight: '면역 방어 및 알칼리성 보충' },
      ],
    },
    benefits: [
      {
        title: '체온 유지 및 혈액 순환 촉진',
        compound: '치네올(Cineole) · 유파틸린',
        description:
          '따뜻한 성질과 정유 성분이 말초 혈액 순환을 도와 냉증 완화와 복부 보온, 여성 건강 관리에 도움을 줍니다.',
      },
      {
        title: '위장 점막 재생 및 항균 작용',
        compound: '유파틸린(Eupatilin) · 탄닌',
        description:
          '위점막 혈류를 개선해 위염 예방에 쓰이며 특유의 정유 성분이 장내 유해균 증식을 억제합니다.',
      },
      {
        title: '강력한 항산화 및 혈관 청소',
        compound: '클로로필 · 베타카로틴',
        description:
          '짙은 녹색 엽록소가 체내 활성산소를 제거하고 콜레스테롤 수치를 낮추는 데 기여합니다.',
      },
    ],
    preparation:
      '봄철 연한 쑥을 뜯어 데친 뒤 찬물에 헹궈 쑥국·쑥떡·쑥전으로 만들고, 단오 무렵 채취한 성숙 쑥은 그늘에 말려 차나 뜸 재료로 씁니다.',
    caution:
      '도로변이나 오염된 도심 풀밭의 쑥은 중금속을 흡수할 수 있으므로 청정 들판에서 채집해야 하며, 국화과 식물 알레르기가 있는 경우 주의하세요.',
  },
  {
    id: 'jerusalem_artichoke',
    nameKo: '돼지감자',
    hanja: '菊芋',
    scientificName: 'Helianthus tuberosus',
    familyKo: '국화과 (Asteraceae)',
    categoryLabel: '현대 주목 구황작물 · 덩이줄기',
    ediblePart: '덩이줄기(뚱딴지)',
    seasonLabel: '가을~이른 봄 수확 (10~3월)',
    growthDurationSec: 23,
    harvestYield: 4,
    seedYield: 2,
    cultivation: {
      growthRateLabel: '보통',
      waterNeed: 'medium',
      requiredWaterings: 1,
      drainRequiredBeforeHarvest: false,
      waterConsumptionPerSec: 0.016,
      sunNeed: 'high',
      optimalSun: 'sunset',
      sunlightBonusFactor: 1.25,
      droughtPenaltyFactor: 0.85,
      conditionSummary: '물 1회 이상 + 노을 양지',
    },
    wildSpawn: {
      allowedSeasons: ['autumn', 'winter'],
      allowedSuns: ['morning', 'sunset', 'night'],
      allowedWeathers: ['clear', 'cloudy', 'snow'],
      spawnChance: 0.32,
      minRespawnSec: 22,
      conditionLabel: '가을·겨울 · 맑음/흐림/눈 (32% 확률)',
    },
    accentHex: '#E0A82E',
    foliageHex: '#508239',
    flowerHex: '#F5CA3B',
    tuberHex: '#B89B72',
    summary:
      '울퉁불퉁한 생김새 때문에 ‘뚱딴지’로 불리지만 천연 인슐린인 이눌린이 가득한 강인한 뿌리작물입니다.',
    morphology:
      '키가 1.5~3m까지 곧게 자라며 거친 털이 있는 넓은 잎이 달립니다. 가을철 줄기 끝에 해바라기를 닮은 선명한 노란 꽃이 피고, 땅속에 생강처럼 울퉁불퉁한 덩이줄기가 달립니다.',
    reliefHistory:
      '아무리 메마른 땅에서도 한 번 뿌리를 내리면 겨울 얼음 속에서도 썩지 않고 번식해 가축 사료와 비상 식량으로 쓰였으며, 오늘날 대사 건강 식품으로 재조명받고 있습니다.',
    habitat: {
      category: 'streamside',
      zoneName: '햇볕 드는 하천변 · 습기 있는 들녘 빈터',
      soilType: '척박지·모래자갈 하천변까지 가리지 않는 강한 적응력',
      sunlight: '양지 (개방된 하천 둑이나 들판에서 꽃이 풍성하게 핌)',
      moisture: '배수가 되면서도 수분 공급이 원활한 하천 주변 최적',
      altitude: '해발 10~700m 하천변, 묵밭, 들녘 가장자리',
      distribution: '전국 하천변, 계곡 하류 빈터, 농촌 유휴지',
      worldFocusPoint: [-6, 1.2, 14],
    },
    nutritionPer100g: {
      caloriesKcal: 73,
      carbsG: 17.4,
      fiberG: 1.6,
      proteinG: 2.0,
      fatG: 0.01,
      keyNutrients: [
        { name: '이눌린 (천연 수용성 다당류)', amount: '16~20', unit: 'g', dailyPercent: 95, highlight: '일반 감자 대비 수십 배 풍부한 프리바이오틱스' },
        { name: '칼륨', amount: '429', unit: 'mg', dailyPercent: 12, highlight: '체내 나트륨 균형' },
        { name: '철분', amount: '3.4', unit: 'mg', dailyPercent: 28, highlight: '피로 회복 및 혈액 생성 보조' },
        { name: '비타민 B1', amount: '0.20', unit: 'mg', dailyPercent: 17, highlight: '신경 및 당질 대사' },
      ],
    },
    benefits: [
      {
        title: '혈당 상승 억제 (천연 인슐린)',
        compound: '이눌린(Inulin)',
        description:
          '위액에 의해 단당류로 잘 분해되지 않는 이눌린이 탄수화물 흡수를 늦춰 식후 혈당의 급격한 상승을 완만하게 막아줍니다.',
      },
      {
        title: '장내 유익균 증식 (프리바이오틱스)',
        compound: '프락토올리고당 · 이눌린',
        description:
          '소장에서 소화되지 않고 대장까지 내려가 비피더스균 등 유익균의 먹이가 되어 장내 환경을 개선합니다.',
      },
      {
        title: '체지방 관리 및 중성지방 감소',
        compound: '수용성 식이섬유 · 폴리페놀',
        description:
          '포만감을 오래 유지하면서도 열량이 낮아 체중 및 혈중 지질 관리에 활용됩니다.',
      },
    ],
    preparation:
      '생으로 아삭하게 썰어 샐러드·장아찌로 먹거나, 얇게 썰어 바짝 말린 뒤 덖어서 구수한 돼지감자차로 우려 마십니다.',
    caution:
      '이눌린이 대장에서 발효될 때 가스를 생성할 수 있으므로 처음부터 과량 섭취하지 말고 소량씩 늘려가며 드시는 것이 좋습니다.',
  },
];

export const CROP_MAP: Record<CropId, ReliefCropData> = RELIEF_CROPS.reduce(
  (acc, crop) => {
    acc[crop.id] = crop;
    return acc;
  },
  {} as Record<CropId, ReliefCropData>,
);

export const HABITAT_LABELS: Record<ReliefCropData['habitat']['category'], string> = {
  hillside: '산기슭·비탈',
  highland: '고지대·자갈밭',
  meadow: '들판·밭둑',
  streamside: '하천변·숲길',
};
