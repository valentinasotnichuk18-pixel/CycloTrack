import React from 'react';
import { Badge } from '@/components/ui/badge';

const SYMPTOMS_BY_PHASE = {
  hypomanic: [
    'Знижена потреба у сні', 'Прискорена мова', 'Грандіозність',
    'Імпульсивність', 'Підвищена енергія', 'Ризикована поведінка',
    'Висока продуктивність', 'Творчий підйом', 'Підвищена комунікабельність',
  ],
  depressive: [
    'Апатія', 'Безсоння', 'Надмірний сон', 'Зниження апетиту',
    'Переїдання', 'Плаксивість', 'Самоізоляція', 'Безнадійність',
    'Хронічна втома', 'Складність зосередитися', 'Втрата інтересів', 'Пасивність',
  ],
  aggressive: [
    'Дратівливість', 'Конфліктність', 'Вибухи гніву', 'Агресія',
    'Провокаційна поведінка', 'Підвищений голос', 'Фізична напруга',
    'Руйнівна поведінка', 'Нетерпіння',
  ],
  anxious: [
    'Тривога', 'Панічні атаки', 'Серцебиття', 'Задуха',
    'Страх', 'Тремтіння', 'Надмірна пильність', 'Уникаюча поведінка',
    'Порушення сну', 'Тривожні думки', 'Напруженість м\'язів',
  ],
  dysphoric: [
    'Внутрішня напруга', 'Неспокій', 'Прискорені думки', 'Агітація',
    'Нездатність розслабитися', 'Метушливість', 'Відчуженість',
    'Емоційне оніміння', 'Нереальність відчуттів',
  ],
  apathetic: [
    'Апатія', 'Втрата інтересів', 'Пасивність', 'Надмірний сон',
    'Емоційне оніміння', 'Хронічна втома', 'Ломота в тілі',
    'Ангедонія', 'Соціальна ізоляція',
  ],
  mixed: [
    'Прискорені думки', 'Пригніченість', 'Агітація', 'Безсоння',
    'Дратівливість', 'Підвищена енергія', 'Тривога',
  ],
  stable: [],
  general: [
    'Головний біль', 'Нудота', 'Запаморочення', 'Зміни апетиту',
    'Порушення сну', 'Зміни ваги',
  ],
};

export default function SymptomPicker({ selected = [], onChange, phase }) {
  const phaseSymptoms = SYMPTOMS_BY_PHASE[phase] || [];
  const allSymptoms = [...new Set([...phaseSymptoms, ...SYMPTOMS_BY_PHASE.general])];

  const toggle = (symptom) => {
    if (selected.includes(symptom)) {
      onChange(selected.filter(s => s !== symptom));
    } else {
      onChange([...selected, symptom]);
    }
  };

  if (allSymptoms.length === 0) {
    return (
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Симптоми</label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS_BY_PHASE.general.map(symptom => (
            <Badge
              key={symptom}
              variant={selected.includes(symptom) ? 'default' : 'outline'}
              className={`cursor-pointer text-xs py-1.5 px-3 transition-all ${
                selected.includes(symptom) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary'
              }`}
              onClick={() => toggle(symptom)}
            >
              {symptom}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">Симптоми</label>
      <div className="flex flex-wrap gap-2">
        {allSymptoms.map(symptom => (
          <Badge
            key={symptom}
            variant={selected.includes(symptom) ? 'default' : 'outline'}
            className={`cursor-pointer transition-all text-xs py-1.5 px-3 ${
              selected.includes(symptom)
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'hover:bg-secondary'
            }`}
            onClick={() => toggle(symptom)}
          >
            {symptom}
          </Badge>
        ))}
      </div>
    </div>
  );
}
