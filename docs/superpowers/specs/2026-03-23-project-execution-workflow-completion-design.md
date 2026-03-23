# Project Execution Workflow Completion Design

Scope: Hoàn thiện workflow thực thi dự án để hệ thống dùng được thực tế, theo thứ tự:
1. Revision lifecycle
2. Event/notification layer
3. Deadline/risk visibility

Date: 2026-03-23

---

## 1. Problem Statement

Workflow hiện tại có các điểm thiếu chính:

- Không có vòng rõ ràng `request revision -> resubmit -> approve/reject`.
- Thiếu timeline sự kiện thống nhất nên SME/Sinh viên dễ bỏ sót trạng thái.
- Thiếu lớp deadline/risk để vận hành dự án thật.

Kết quả là quy trình giao-nhận đầu ra chưa đủ tin cậy khi chạy production.

## 2. Goals

- Cho phép nhiều vòng revision cho tới khi SME quyết định cuối.
- Cho phép kết thúc thất bại rõ ràng (`FAILED`) khi SME reject cuối.
- Ghi lại event timeline đầy đủ cho mọi action quan trọng.
- Tạo nền cho notification unread/read và risk monitoring.

## 3. Non-Goals

- Không triển khai billing/escrow/contract.
- Không thay đổi engine embedding/matching ở scope này.
- Không xây back-office admin lớn trong phase này.

## 4. Lifecycle Rules

### 4.1 Project/Progress state transitions

- `IN_PROGRESS -> SUBMITTED` khi sinh viên nộp deliverable.
- `SUBMITTED -> REVISION_REQUIRED` khi SME yêu cầu sửa.
- `REVISION_REQUIRED -> SUBMITTED` khi sinh viên resubmit.
- `SUBMITTED -> COMPLETED` khi SME approve.
- `SUBMITTED | REVISION_REQUIRED -> FAILED` khi SME reject cuối.

### 4.2 Revision rounds

- Mỗi lần SME yêu cầu sửa tạo một round mới (`roundNumber` tăng dần).
- Round mới bắt đầu ở `REQUESTED`.
- Khi sinh viên nộp lại, round hiện tại thành `RESUBMITTED`.
- Khi SME approve/reject cuối, round mở hiện tại đóng thành `APPROVED` hoặc `REJECTED`.
- Cho phép số vòng revision không giới hạn.

## 5. Data Model Changes

### 5.1 Enum updates

- `ProjectStatus`: thêm `REVISION_REQUIRED`, `FAILED`.
- `ProgressStatus`: thêm `REVISION_REQUIRED`, `FAILED`.
- Thêm `RevisionStatus`: `REQUESTED`, `RESUBMITTED`, `APPROVED`, `REJECTED`.
- Thêm `ProjectEventType`:
  - `DELIVERABLE_SUBMITTED`
  - `REVISION_REQUESTED`
  - `DELIVERABLE_RESUBMITTED`
  - `PROJECT_APPROVED`
  - `PROJECT_REJECTED`
  - `MILESTONE_ADDED`
  - `PROGRESS_UPDATED`

### 5.2 New tables

- `ProjectRevision`
  - `id`, `projectId`, `progressId`, `roundNumber`
  - `status`
  - `requestNote`, `requestedById`, `requestedAt`
  - `resubmissionNote`, `resubmittedDeliverableUrl`, `resubmittedAt`
  - `resolvedAt`

- `ProjectEvent`
  - `id`, `projectId`, `progressId?`, `actorUserId`
  - `type`, `message`, `metadata(Json)`
  - `createdAt`

### 5.3 Future extension

- `Notification` sẽ thêm ở Phase 2, tiêu thụ từ `ProjectEvent`.

## 6. Use-Case Contracts

### 6.1 `requestRevisionBySme`

Input:
- `projectId`, `userId`, `note`

Guards:
- SME ownership
- Project đang `SUBMITTED`

Effects (1 transaction):
- Update `project/progress -> REVISION_REQUIRED`
- Create `ProjectRevision(REQUESTED, round n)`
- Create `ProjectEvent(REVISION_REQUESTED)`

### 6.2 `resubmitDeliverableByStudent`

Input:
- `progressId`, `projectId`, `userId`, `deliverableUrl`, `note?`

Guards:
- Student ownership
- Project đang `REVISION_REQUIRED`
- Có round mở `REQUESTED`

Effects (1 transaction):
- Update round mở -> `RESUBMITTED`
- Update deliverable URL
- Update `project/progress -> SUBMITTED`
- Create `ProjectEvent(DELIVERABLE_RESUBMITTED)`

### 6.3 `approveProjectBySme`

Input:
- `projectId`, `userId`

Guards:
- SME ownership
- Project `SUBMITTED` + có deliverable

Effects (1 transaction):
- `project/progress -> COMPLETED`
- Round mở (nếu có) -> `APPROVED`
- Create `ProjectEvent(PROJECT_APPROVED)`

### 6.4 `rejectProjectBySme`

Input:
- `projectId`, `userId`, `reason`

Guards:
- SME ownership
- Project `SUBMITTED` hoặc `REVISION_REQUIRED`

Effects (1 transaction):
- `project/progress -> FAILED`
- Round mở (nếu có) -> `REJECTED`
- Create `ProjectEvent(PROJECT_REJECTED)`

## 7. Error Model

Standard errors:
- `FORBIDDEN`
- `PROJECT_NOT_FOUND`
- `PROGRESS_NOT_FOUND`
- `REVISION_REQUEST_INVALID`
- `RESUBMIT_INVALID`
- `APPROVE_INVALID`
- `REJECT_INVALID`
- `ROUND_NOT_FOUND`

HTTP mapping:
- `403` for ownership/role
- `404` for missing entities
- `409` for invalid state transitions

## 8. UI/Route Impact

Primary impacted surfaces:
- `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- `src/app/(dashboard)/student/my-projects/page.tsx`
- `src/app/(dashboard)/student/my-projects/project-progress-actions.tsx`

Required UI behavior:
- Khi `SUBMITTED`: SME thấy `Approve`, `Request revision`, `Reject`.
- Khi `REVISION_REQUIRED`: Student thấy panel revision note + CTA `Resubmit`.
- Khi `FAILED`: cả hai phía thấy trạng thái kết thúc và timeline sự kiện.

## 9. Testing Requirements

### 9.1 Unit
- State transition table cho 4 actions chính.
- Round logic (`REQUESTED -> RESUBMITTED -> APPROVED/REJECTED`).
- Event emission đúng type/actor/metadata.

### 9.2 Integration
- Mỗi action đảm bảo atomic update:
  - state
  - revision
  - event

### 9.3 Regression
- Luồng cũ `submit -> completed` vẫn hợp lệ.
- Rule đánh giá chỉ mở ở `COMPLETED` giữ nguyên.

## 10. Rollout Strategy

Phase 1:
- Revision lifecycle + transitions + UI actions.

Phase 2:
- Event feed + notification unread/read.

Phase 3:
- Deadline/risk model + cảnh báo quá hạn + badge risk trên dashboard/detail.

## 11. Success Criteria

- Có thể chạy nhiều vòng revision liên tục không mất lịch sử.
- Mỗi thay đổi lifecycle đều có event timeline.
- Project có thể kết thúc rõ ràng ở `COMPLETED` hoặc `FAILED`.
- Người dùng không bị mơ hồ trạng thái bàn giao/revision hiện tại.
