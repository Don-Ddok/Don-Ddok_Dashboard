// 팀 게시판: GitHub Discussions에 글을 저장하는 giscus로 연결한다(서버·DB 없음, GitHub 로그인으로 글쓰기)
// categoryId는 저장소에서 Discussions를 켜고 giscus 앱을 설치한 뒤 채운다. 비어 있으면 화면은 '연결 준비 중'을 보여 준다.

export const BOARD = {
  repo: 'Don-Ddok/Don-Ddok_Dashboard',
  repoId: 'R_kgDOUssi7g',
  category: 'Announcements', // 관리자와 giscus만 새 글타래를 열 수 있는 분류(외부인이 주제를 새로 만들 수 없음)
  categoryId: 'DIC_kwDOUssi7s4DGgXK',
  discussionsUrl: 'https://github.com/Don-Ddok/Don-Ddok_Dashboard/discussions',
} as const

/** 주제마다 글타래 하나. term이 GitHub Discussions의 글 제목이 된다 */
export const TOPICS = [
  { key: 'free', label: '자유 의견', term: '팀 게시판: 자유 의견', hint: '진행 상황, 아이디어, 공지' },
  { key: 'results', label: '분석 결과', term: '팀 게시판: 분석 결과', hint: '분석 결과 공유, 표·그래프와 해석' },
  { key: 'dashboard', label: '화면 개선 제안', term: '팀 게시판: 화면 개선 제안', hint: '이 웹사이트에서 고칠 점' },
] as const

export type TopicKey = (typeof TOPICS)[number]['key']
