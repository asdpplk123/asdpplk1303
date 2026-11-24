import React from 'react';
import { CROP_MAP } from '../data/reliefCrops';
import { CropId } from '../types/botany';

interface BotanicalIllustrationProps {
  cropId: CropId;
  unlocked: boolean;
}

export const BotanicalIllustration: React.FC<BotanicalIllustrationProps> = ({
  cropId,
  unlocked,
}) => {
  const crop = CROP_MAP[cropId];

  const renderSpecimen = () => {
    switch (cropId) {
      case 'sweet_potato':
        return (
          <g>
            {/* Soil horizon */}
            <path d="M24 128 Q100 120 176 128" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Spindle tubers */}
            <path d="M68 134 C56 150, 74 176, 94 168 C108 162, 102 138, 86 130 Z" fill={crop.tuberHex} stroke="#4A252A" strokeWidth="1.6" />
            <path d="M108 136 C122 146, 138 172, 118 176 C100 180, 96 152, 104 134 Z" fill="#B84B5C" stroke="#4A252A" strokeWidth="1.6" />
            {/* Vines and heart leaves */}
            <path d="M96 128 C94 102, 72 86, 54 74" stroke="#4A6E3B" strokeWidth="2.4" fill="none" />
            <path d="M96 128 C102 96, 128 76, 148 64" stroke="#4A6E3B" strokeWidth="2.4" fill="none" />
            <path d="M54 74 C40 60, 32 76, 48 92 C60 88, 62 78, 54 74 Z" fill={crop.foliageHex} stroke="#284723" strokeWidth="1.4" />
            <path d="M100 84 C88 64, 108 46, 122 66 C122 82, 108 88, 100 84 Z" fill={crop.foliageHex} stroke="#284723" strokeWidth="1.4" />
            <path d="M148 64 C146 44, 170 46, 166 66 C162 76, 152 74, 148 64 Z" fill="#5D9E52" stroke="#284723" strokeWidth="1.4" />
          </g>
        );
      case 'potato':
        return (
          <g>
            <path d="M24 128 Q100 122 176 128" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <ellipse cx="78" cy="152" rx="22" ry="15" fill={crop.tuberHex} stroke="#5E4627" strokeWidth="1.6" />
            <ellipse cx="118" cy="158" rx="18" ry="13" fill="#D4B27D" stroke="#5E4627" strokeWidth="1.6" />
            <circle cx="72" cy="148" r="1.5" fill="#5E4627" />
            <circle cx="84" cy="156" r="1.5" fill="#5E4627" />
            <path d="M100 128 L100 56" stroke="#3E6B38" strokeWidth="2.8" />
            <path d="M100 100 L68 78 M100 86 L132 66" stroke="#3E6B38" strokeWidth="2" />
            <ellipse cx="64" cy="76" rx="14" ry="8" transform="rotate(-20 64 76)" fill={crop.foliageHex} stroke="#244722" strokeWidth="1.4" />
            <ellipse cx="134" cy="64" rx="15" ry="8" transform="rotate(20 134 64)" fill={crop.foliageHex} stroke="#244722" strokeWidth="1.4" />
            <circle cx="100" cy="48" r="9" fill="#FFFFFF" stroke="#B6B6A8" strokeWidth="1.4" />
            <circle cx="100" cy="48" r="3" fill="#E6B83B" />
          </g>
        );
      case 'doraji':
        return (
          <g>
            <path d="M24 128 Q100 122 176 128" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Forked white taproot */}
            <path d="M94 126 C92 146, 86 164, 78 178 C88 170, 96 154, 100 144 C104 156, 112 170, 120 176 C112 162, 108 144, 106 126 Z" fill={crop.tuberHex} stroke="#7A6E56" strokeWidth="1.5" />
            <path d="M100 126 L100 54" stroke="#3C6E4B" strokeWidth="2.6" />
            <path d="M100 102 C82 94, 72 86, 68 78 C82 82, 92 90, 100 96" fill={crop.foliageHex} stroke="#244B32" strokeWidth="1.3" />
            <path d="M100 90 C118 82, 128 74, 132 66 C118 70, 108 78, 100 84" fill={crop.foliageHex} stroke="#244B32" strokeWidth="1.3" />
            {/* 5-pointed bellflower */}
            <path d="M100 32 L112 46 L124 44 L114 58 L118 70 L100 62 L82 70 L86 58 L76 44 L88 46 Z" fill={crop.flowerHex} stroke="#49399C" strokeWidth="1.5" />
            <circle cx="100" cy="52" r="3.5" fill="#F2E49B" />
          </g>
        );
      case 'kudzu':
        return (
          <g>
            <path d="M24 128 Q100 122 176 128" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Thick woody root */}
            <path d="M84 126 C78 146, 70 166, 84 176 C100 184, 118 168, 116 146 C114 134, 108 128, 102 126 Z" fill={crop.tuberHex} stroke="#442B1A" strokeWidth="1.6" />
            {/* Coiling vine */}
            <path d="M98 126 C116 106, 80 86, 104 66 C122 50, 96 36, 90 28" stroke="#5A422D" strokeWidth="2.8" fill="none" />
            {/* Trifoliate leaves */}
            <circle cx="72" cy="76" r="14" fill={crop.foliageHex} stroke="#2A4620" strokeWidth="1.4" />
            <circle cx="128" cy="68" r="14" fill={crop.foliageHex} stroke="#2A4620" strokeWidth="1.4" />
            {/* Hanging purple flower cluster */}
            <path d="M114 42 C122 44, 126 56, 118 68 C110 60, 108 48, 114 42 Z" fill={crop.flowerHex} stroke="#5F2E61" strokeWidth="1.4" />
          </g>
        );
      case 'yam':
        return (
          <g>
            <path d="M24 128 Q100 122 176 128" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M92 126 L88 176 C88 182, 112 182, 112 176 L108 126 Z" fill={crop.tuberHex} stroke="#6E5D43" strokeWidth="1.6" />
            <path d="M100 126 C88 102, 114 78, 96 42" stroke="#356E42" strokeWidth="2.4" fill="none" />
            <path d="M74 86 C64 70, 86 64, 92 82 C88 92, 78 94, 74 86 Z" fill={crop.foliageHex} stroke="#1F4728" strokeWidth="1.3" />
            <path d="M126 68 C134 52, 110 48, 106 66 C110 74, 120 76, 126 68 Z" fill={crop.foliageHex} stroke="#1F4728" strokeWidth="1.3" />
            <circle cx="98" cy="96" r="4.5" fill="#9E8254" stroke="#524127" strokeWidth="1.2" />
          </g>
        );
      case 'buckwheat':
        return (
          <g>
            <path d="M24 142 Q100 136 176 142" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Reddish stems */}
            <path d="M100 140 L100 54 M100 112 L74 72 M100 98 L128 66" stroke="#A84A57" strokeWidth="2.5" />
            <polygon points="62,92 82,82 78,104" fill={crop.foliageHex} stroke="#2E4C22" strokeWidth="1.3" />
            <polygon points="138,88 118,80 124,102" fill={crop.foliageHex} stroke="#2E4C22" strokeWidth="1.3" />
            {/* White flower clusters */}
            <circle cx="100" cy="46" r="12" fill="#FFFFFF" stroke="#D1C7BA" strokeWidth="1.3" />
            <circle cx="72" cy="64" r="9" fill="#FFFFFF" stroke="#D1C7BA" strokeWidth="1.3" />
            <circle cx="130" cy="58" r="9" fill="#FFFFFF" stroke="#D1C7BA" strokeWidth="1.3" />
            <polygon points="100,152 92,168 108,168" fill={crop.tuberHex} stroke="#382B23" strokeWidth="1.3" />
          </g>
        );
      case 'millet':
        return (
          <g>
            <path d="M24 150 Q100 144 176 150" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M90 148 C90 110, 92 78, 76 54" stroke="#6E8738" strokeWidth="2.5" fill="none" />
            <path d="M110 148 C112 104, 114 70, 128 48" stroke="#6E8738" strokeWidth="2.5" fill="none" />
            <path d="M90 110 Q66 96 54 114" stroke={crop.foliageHex} strokeWidth="3.2" fill="none" />
            <path d="M110 102 Q134 88 148 108" stroke={crop.foliageHex} strokeWidth="3.2" fill="none" />
            {/* Heavy golden panicles */}
            <ellipse cx="70" cy="66" rx="9" ry="22" transform="rotate(28 70 66)" fill={crop.flowerHex} stroke="#9A721E" strokeWidth="1.4" />
            <ellipse cx="132" cy="60" rx="9" ry="22" transform="rotate(-28 132 60)" fill={crop.flowerHex} stroke="#9A721E" strokeWidth="1.4" />
          </g>
        );
      case 'shepherds_purse':
        return (
          <g>
            <path d="M24 140 Q100 134 176 140" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M100 138 L96 172 M100 146 L108 168" stroke="#D8CEB2" strokeWidth="2" />
            {/* Rosette leaves */}
            <ellipse cx="74" cy="130" rx="22" ry="7" transform="rotate(-14 74 130)" fill={crop.foliageHex} stroke="#284F25" strokeWidth="1.3" />
            <ellipse cx="126" cy="130" rx="22" ry="7" transform="rotate(14 126 130)" fill={crop.foliageHex} stroke="#284F25" strokeWidth="1.3" />
            {/* Flower stem & heart-shaped seed pods */}
            <path d="M100 138 L100 42" stroke="#4D7E42" strokeWidth="2.2" />
            <polygon points="84,86 92,74 76,74" fill="#73AA63" stroke="#365C2D" strokeWidth="1.1" />
            <polygon points="116,74 124,62 108,62" fill="#73AA63" stroke="#365C2D" strokeWidth="1.1" />
            <circle cx="100" cy="38" r="5.5" fill="#FFFFFF" stroke="#BDBDB0" strokeWidth="1.2" />
          </g>
        );
      case 'mugwort':
        return (
          <g>
            <path d="M24 146 Q100 140 176 146" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M84 144 L78 68 M100 144 L100 50 M116 144 L122 72" stroke="#4B7352" strokeWidth="2.4" />
            {[
              [74, 84],
              [100, 62],
              [126, 86],
              [84, 108],
              [116, 110],
            ].map(([cx, cy], idx) => (
              <path
                key={idx}
                d={`M${cx} ${cy - 14} C${cx + 14} ${cy - 8}, ${cx + 12} ${cy + 10}, ${cx} ${cy + 14} C${cx - 12} ${cy + 10}, ${cx - 14} ${cy - 8}, ${cx} ${cy - 14} Z`}
                fill={crop.foliageHex}
                stroke="#294833"
                strokeWidth="1.3"
              />
            ))}
          </g>
        );
      case 'jerusalem_artichoke':
        return (
          <g>
            <path d="M24 134 Q100 128 176 134" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Knobby tubers */}
            <path d="M74 148 C66 156, 74 172, 88 168 C96 174, 114 166, 112 152 C118 144, 106 136, 94 142 Z" fill={crop.tuberHex} stroke="#634F35" strokeWidth="1.6" />
            <path d="M100 134 L100 54" stroke="#4B7B37" strokeWidth="2.8" />
            <ellipse cx="76" cy="98" rx="18" ry="9" transform="rotate(-18 76 98)" fill={crop.foliageHex} stroke="#284A1E" strokeWidth="1.3" />
            <ellipse cx="124" cy="88" rx="18" ry="9" transform="rotate(18 124 88)" fill={crop.foliageHex} stroke="#284A1E" strokeWidth="1.3" />
            {/* Sunflower-like golden head */}
            <circle cx="100" cy="48" r="19" fill={crop.flowerHex} stroke="#B3801A" strokeWidth="1.4" />
            <circle cx="100" cy="48" r="8" fill="#5D3A1C" />
          </g>
        );
      case 'sorghum':
        return (
          <g>
            <path d="M24 148 Q100 142 176 148" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M100 146 L100 58" stroke="#5B7D3B" strokeWidth="3" />
            <path d="M100 118 Q70 104 54 122" stroke={crop.foliageHex} strokeWidth="3.5" fill="none" />
            <path d="M100 102 Q132 88 146 108" stroke={crop.foliageHex} strokeWidth="3.5" fill="none" />
            {/* Dense crimson-brown sorghum panicle */}
            <ellipse cx="100" cy="48" rx="14" ry="26" fill={crop.flowerHex} stroke="#5F1E1A" strokeWidth="1.5" />
            <circle cx="95" cy="40" r="3" fill="#C4534B" />
            <circle cx="105" cy="52" r="3" fill="#C4534B" />
            <circle cx="97" cy="60" r="3" fill="#C4534B" />
          </g>
        );
      case 'corn':
        return (
          <g>
            <path d="M24 148 Q100 142 176 148" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M100 146 L100 44" stroke="#4D7E39" strokeWidth="3.4" />
            {/* Top tassel */}
            <path d="M100 44 L86 26 M100 44 L100 24 M100 44 L114 26" stroke="#C9A243" strokeWidth="1.8" />
            <path d="M100 112 Q64 98 48 118" stroke={crop.foliageHex} strokeWidth="3.6" fill="none" />
            <path d="M100 94 Q136 80 152 102" stroke={crop.foliageHex} strokeWidth="3.6" fill="none" />
            {/* Golden corn ear */}
            <ellipse cx="115" cy="86" rx="10" ry="22" transform="rotate(24 115 86)" fill={crop.tuberHex} stroke="#8B6817" strokeWidth="1.5" />
            <path d="M106 104 C104 88, 110 74, 116 68" stroke="#3E6E2E" strokeWidth="2.4" fill="none" />
          </g>
        );
      case 'barley':
        return (
          <g>
            <path d="M24 148 Q100 142 176 148" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <path d="M88 146 L82 68 M100 146 L100 56 M112 146 L118 68" stroke="#7A9440" strokeWidth="2.2" />
            <ellipse cx="82" cy="56" rx="6" ry="18" transform="rotate(-10 82 56)" fill={crop.flowerHex} stroke="#8C6D27" strokeWidth="1.3" />
            <ellipse cx="100" cy="46" rx="6.5" ry="20" fill={crop.flowerHex} stroke="#8C6D27" strokeWidth="1.3" />
            <ellipse cx="118" cy="56" rx="6" ry="18" transform="rotate(10 118 56)" fill={crop.flowerHex} stroke="#8C6D27" strokeWidth="1.3" />
            {/* Bearded awns */}
            <path d="M80 38 L75 24 M100 26 L100 14 M120 38 L125 24" stroke="#B69340" strokeWidth="1.2" />
          </g>
        );
      case 'pumpkin':
        return (
          <g>
            <path d="M24 146 Q100 140 176 146" stroke="#8C7A63" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Ribbed pumpkin */}
            <ellipse cx="100" cy="124" rx="34" ry="23" fill={crop.tuberHex} stroke="#7A4112" strokeWidth="1.6" />
            <ellipse cx="100" cy="124" rx="18" ry="23" fill="none" stroke="#8E4D16" strokeWidth="1.2" />
            <path d="M97 101 C96 92, 102 88, 105 91 L103 101 Z" fill="#4B662E" stroke="#2D4219" strokeWidth="1.2" />
            {/* Broad vine leaves & yellow blossom */}
            <path d="M68 124 C50 110, 44 82, 64 70" stroke="#477F3A" strokeWidth="2.5" fill="none" />
            <circle cx="62" cy="66" r="15" fill={crop.foliageHex} stroke="#284A20" strokeWidth="1.4" />
            <circle cx="138" cy="88" r="10" fill={crop.flowerHex} stroke="#A87815" strokeWidth="1.3" />
          </g>
        );
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-52 rounded-lg border border-[#2c362e]/15 bg-[#f3efe4] overflow-hidden">
      <svg
        viewBox="0 0 200 190"
        className={`w-44 h-44 transition-opacity duration-300 ${
          unlocked ? 'opacity-100' : 'opacity-25 grayscale'
        }`}
        aria-label={`${crop.nameKo} 식물 세밀 도판`}
      >
        {/* Subtle botanical plate frame */}
        <rect
          x="10"
          y="10"
          width="180"
          height="170"
          rx="4"
          fill="none"
          stroke="#2c362e"
          strokeOpacity="0.14"
          strokeWidth="1"
        />
        {renderSpecimen()}
      </svg>
      {!unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f3efe4]/75 text-center px-4">
          <span className="text-xs font-medium text-[#4a554c]">미발견 식물 표본</span>
          <span className="mt-1 text-xs text-[#69746b]">
            야생 채집 또는 농장 수확 시 도판이 기록됩니다
          </span>
        </div>
      )}
    </div>
  );
};
