export const THEME_STORAGE_KEY = 'manifest-board-theme'

export const themes = [
  {
    id: 'lavender-evening',
    label: 'Lavender Evening',
    description: 'Dreamy, reflective, and calm.',
    colors: {
      background: '#F6F4FB',
      surface: '#ECE7F6',
      primary: '#B6A8D9',
      accent: '#8E82B8',
      text: '#4E4763',
    },
  },
  {
    id: 'warm-sunset',
    label: 'Warm Sunset',
    description: 'Earthy, cozy, and warm.',
    colors: {
      background: '#F6F1E9',
      surface: '#E8DCCF',
      primary: '#C97B63',
      accent: '#7A8B6F',
      text: '#5C4A3D',
    },
  },
  {
    id: 'vintage-rose',
    label: 'Vintage Rose',
    description: 'Romantic, soft, and elegant.',
    colors: {
      background: '#FAF6F4',
      surface: '#F2E6E3',
      primary: '#D8A7A7',
      accent: '#B9A1C8',
      text: '#7A6661',
    },
  },
  {
    id: 'forest-cottage',
    label: 'Forest Cottage',
    description: 'Grounded, natural, and mature.',
    colors: {
      background: '#F5F3EE',
      surface: '#E7E3DA',
      primary: '#6B8F71',
      accent: '#9CAF88',
      text: '#3F4A44',
    },
  },
  {
    id: 'stone-harbor',
    label: 'Stone Harbor',
    description: 'Muted, coastal, and refined.',
    colors: {
      background: '#F3EEE8',
      surface: '#D0C0AA',
      primary: '#BA8E79',
      accent: '#7C7463',
      text: '#435B64',
    },
  },
  {
    id: 'blush-meadow',
    label: 'Blush Meadow',
    description: 'Soft, airy, and botanical.',
    colors: {
      background: '#FDF6EB',
      surface: '#F7D6C5',
      primary: '#E0B7C8',
      accent: '#9BBF9B',
      text: '#5F7860',
    },
  },
]

export const defaultThemeId = 'warm-sunset'

export function getThemeById(themeId) {
  return themes.find((theme) => theme.id === themeId) ?? themes.find((theme) => theme.id === defaultThemeId)
}

export function isThemeId(themeId) {
  return themes.some((theme) => theme.id === themeId)
}
