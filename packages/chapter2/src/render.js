// JSX 문법으로 작성된 컴포넌트를 자바스크립트 객체로 변화하여, 리액트의 Virtual DOM과 유사한 구조로 만들어주는 함수
export function jsx(type, props, ...children) {
  // jsx 함수를 구현합니다. (dom 구조와 비슷한 객체를 만들어서 사용하기 위함)
  return { type, props: props || {}, children: [...children] };
  // return { type, props: { ...props, children } };
}

/* 
const node = {
  props: {
    id: "uniqueId",
    className: "container",
    disabled: false,
    onClick: () => console.log("Clicked"),
    style: null
  }
};
*/

/* export function createElement(node) {
  // jsx를 dom으로 변환
  if (typeof node === 'string') {
    return document.createTextNode(node); // 텍스트 노드 생성후 반환
  }

  // tag에 대한 element 생성
  const element = document.createElement(node.type);

  Object.entries(node.props || {}) //객체의 각 속성에 대해 [키, 값] 쌍을 요소로 하는 배열을 생성
    .filter(([attribute, value]) => value) // value가 truthy한 것만 필터링
    .forEach(([attribute, value]) => element.setAttribute(attribute, value)); // 속성을 element에 추가

  const children = node.children.map(createElement); // 자식 노드에 대해 재귀적으로 createElement 함수 호출
  children.forEach((child) => element.appendChild(child)); // 자식 노드를 element에 추가
  return element;
} */

// 가상돔을 실제 돔으로 변환하여(리액트의 가상돔 개념을 실제 브라우저 돔에 매핑하는 작업), 웹페이지에 렌더링하는 함수
// createElement 함수는 JSX 또는 가상 DOM 트리 구조를 실제 DOM 요소로 변환하고, updateAttributes를 통해 속성을 설정하며, node.children 배열을 순회하여 자식 요소들을 재귀적으로 DOM으로 변환하고 부모 요소에 추가하는 역할
export function createElement(node) {
  if (typeof node === 'string') {
    // 문자열인 경우 텍스트 노드 생성 후 반환
    return document.createTextNode(node);
  }

  // 태그에 대한 요소 생성
  const element = document.createElement(node.type);

  /*   // props의 각 속성을 element에 설정
  Object.entries(node.props || {})
    .filter(([attribute, value]) => value !== undefined) // undefined가 아닌 값을 필터링
    .forEach(([attribute, value]) => {
      // children을 제외한 속성을 설정
      if (attribute !== 'children') {
        element.setAttribute(attribute, value);
      }
    });

  // children이 정의되어 있고, 배열인 경우에만 처리
  if (node.props && Array.isArray(node.props.children)) {
    node.props.children.forEach((child) => {
      // 재귀적으로 createElement 호출 및 자식 요소로 추가
      const childElement = createElement(child);
      element.appendChild(childElement);
    });
  } */

  updateAttributes(element, node.props || {}, {}); // node.props의 속성을 element에 설정 (이전 속성은 없는 초기화 상황)

  node.children.forEach((child) => {
    element.appendChild(createElement(child));
  });

  return element;
}

function updateAttributes(target, newProps, oldProps) {
  // newProps들을 반복하여 각 속성과 값을 확인
  for (const [attribute, value] of Object.entries(newProps)) {
    //   만약 oldProps에 같은 속성이 있고 값이 동일하다면, 다음 속성으로 넘어감 (변경 불필요)
    if (oldProps[attribute] === value) continue;
    //   만약 위 조건에 해당하지 않는다면 (속성값이 다르거나 구속성에 없음), target에 해당 속성을 새 값으로 설정
    target.setAttribute(attribute, value);
  }
  /*   // oldProps을 반복하여 각 속성 확인
    for (const [attribute, value] of Object.entries(oldProps)) {
      //   만약 newProps들에 해당 속성이 존재한다면, 다음 속성으로 넘어감 (속성 유지 필요)
      // if (newProps[attribute]) continue;
      if (newProps[attribute] !== undefined) continue;
      //   만약 newProps들에 해당 속성이 존재하지 않는다면,   target에서 해당 속성을 제거
      target.removeAttribute(attribute);
    } */

  for (const attribute in oldProps) {
    if (attribute in newProps) continue; // newProps에 있는 속성은 유지
    target.removeAttribute(attribute); // oldProps에만 있는 속성은 제거
  }
}

export function render(parent, newNode, oldNode, index = 0) {
  // 1. 만약 newNode가 없고 oldNode만 있다면
  //   parent에서 oldNode를 제거
  //   종료
  if (!newNode && oldNode) {
    return parent.removeChild(parent.childNodes[index]);
  }
  // 2. 만약 newNode가 있고 oldNode가 없다면
  //   newNode를 생성하여 parent에 추가
  //   종료
  if (newNode && !oldNode) {
    return parent.appendChild(createElement(newNode));
  }
  // 3. 만약 newNode와 oldNode 둘 다 문자열이고 서로 다르다면
  //   oldNode를 newNode로 교체
  //   종료
  if (
    typeof newNode === 'string' &&
    typeof oldNode === 'string' &&
    newNode !== oldNode
  ) {
    return parent.replaceChild(
      document.createTextNode(newNode),
      parent.childNodes[index]
    );
  }
  // 4. 만약 newNode와 oldNode의 타입이 다르다면
  //   oldNode를 newNode로 교체
  //   종료
  if (newNode.type !== oldNode.type) {
    return parent.replaceChild(
      createElement(newNode),
      parent.childNodes[index]
    );
  }
  /*   // 5. newNode와 oldNode에 대해 updateAttributes 실행
  updateAttributes(
    parent.childNodes[index],
    newNode.props || {},
    oldNode.props || {}
  );
  // 6. newNode와 oldNode 자식노드들 중 더 긴 길이를 가진 것을 기준으로 반복
  //    const max = Math.max(
  //   newNode.props.children.length,
  //   oldNode.props.children.length
  // ); 
  // newNode와 oldNode의 children의 길이를 비교하기 전에,
  // children이 존재하지 않는 경우 빈 배열을 사용하여 오류를 방지
  const newNodeChildren =
    newNode.props && newNode.props.children ? newNode.props.children : [];
  const oldNodeChildren =
    oldNode.props && oldNode.props.children ? oldNode.props.children : [];

  // 더 긴 children 배열의 길이를 기준으로 반복
  const max = Math.max(newNodeChildren.length, oldNodeChildren.length);

  //   각 자식노드에 대해 재귀적으로 render 함수 호출
  for (let i = 0; i < max; i++) {
    render(parent.childNodes[index], newNodeChildren[i], oldNodeChildren[i], i);
  } */

  // 5. newNode와 oldNode에 대해 updateAttributes 실행
  if (newNode.type && oldNode.type && newNode.type === oldNode.type) {
    updateAttributes(parent.childNodes[index], newNode.props, oldNode.props);
  }

  // 6. newNode와 oldNode 자식노드들 중 더 긴 길이를 가진 것을 기준으로 반복
  const max = Math.max(newNode.children?.length, oldNode.children?.length);
  for (let i = 0; i < max; i++) {
    render(
      parent.childNodes[index],
      newNode.children[i],
      oldNode.children[i],
      i
    );
  }
}
