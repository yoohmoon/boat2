export function createHooks(callback) {
  let states = []; //컴포넌트 내부에서 사용하는 상태값을 저장하는 배열
  let currentIdx = 0; //현재 처리중인 상태값의 인덱스

  const useState = (initState) => {
    const idx = currentIdx;
    currentIdx++; //useState가 호출될 때마다 상태값의 인덱스를 증가시켜 각 호출이 고유한 인덱스를 가지도록 함

    if (states[idx] === undefined) {
      //컴포넌트가 최초로 렌더링될 때만 초기 상태값을 설정
      states[idx] = initState;
    }
    return [
      states[idx],
      (newState) => {
        if (states[idx] === newState) return;
        states[idx] = newState; //현재 상태와 다를 경우에만 상태값을 업데이트
        callback();
      },
    ];
  };

  /* useMemo : 계산 비용이 많이 드는 연산의 결과값을 메모이징(기억)하여, 
                의존성 배열(refs) 내의 값이 변경될 때에만 함수(fn)를 다시 실행하고 결과를 다시 계산 */
  let memo;
  let deps = [];
  const useMemo = (fn, refs) => {
    if (memo === undefined || refs.some((ref, idx) => ref !== deps[idx])) {
      memo = fn();
      deps = refs;
    }
    return memo;
  };

  const resetContext = () => {
    currentIdx = 0;
  };

  return { useState, useMemo, resetContext };
}
