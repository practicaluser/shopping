import React from 'react';

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">통계분석</h2>
      <p className="text-gray-600">매출 및 사용자 통계를 확인하세요.</p>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500">통계 차트가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
