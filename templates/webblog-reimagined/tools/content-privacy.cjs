// Keep the approved school descriptions when importing the original site again.
// Limit this edit to the personal homepage; article citations remain untouched.
function generalizeSchools(home, lang) {
  const replacements = lang === 'zh' ? [
    [/华南理工大学|\bSCUT\b/g, '华南地区某985'],
    [/香港科技大学|\bHKUST\b/g, '香港前三某大学'],
  ] : [
    [/SCUT Research Lab/g, 'a research lab at a Project 985 university in South China'],
    [/South China University of Technology|\bSCUT\b/g, 'a Project 985 university in South China'],
    [/Hong Kong University of Science and Technology|\bHKUST\b/g, 'a top-three university in Hong Kong'],
  ];
  function visit(value) {
    if (typeof value === 'string') {
      return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
    }
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, visit(item)]));
    return value;
  }
  const result = visit(home);
  // Titles start with capitals; prose keeps its normal sentence casing.
  if (lang === 'en') {
    result.education = result.education.map(item => ({...item, title: item.title.replace(/^a /, 'A ')}));
  } else {
    result.milestones = result.milestones.map(item => ({...item, text: item.text.replace('已入学 香港前三某大学', '已入学香港前三某大学')}));
  }
  return result;
}

module.exports = {generalizeSchools};
