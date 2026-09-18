'use client';

import { Button, Modal } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ScheduleForm from '@/app/gatherings/[id]/schedules/ScheduleForm';
import { deleteScheduleAction } from '@/app/gatherings/[id]/schedules/actions';
import UserInfo from '@/components/UserInfo';

export default function ScheduleDetailModal({
  currentUserId,
  gatheringId,
  schedule,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const isAuthor = currentUserId && schedule?.userId === currentUserId;

  function handleEditSuccess() {
    setIsEditing(false);
    router.refresh();
  }

  function handleClose() {
    setIsEditing(false);
    if (isControlled) {
      controlledOnOpenChange?.(false);
    } else {
      setInternalIsOpen(false);
    }
  }

  if (!schedule) return null;

  return (
    <>
      {!isControlled && (
        trigger ? (
          <div
            onClick={() => {
              setIsEditing(false);
              setInternalIsOpen(true);
            }}
          >
            {trigger}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setInternalIsOpen(true);
            }}
            className="text-left font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            {schedule.title}
          </button>
        )
      )}

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  {isEditing ? '일정 수정' : schedule.title}
                </Modal.Heading>
                <Modal.CloseTrigger
                  aria-label="닫기"
                  onPress={handleClose}
                  onClick={handleClose}
                />
              </Modal.Header>
              <Modal.Body>
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <ScheduleForm
                      gatheringId={gatheringId}
                      initialValues={{
                        title: schedule.title,
                        description: schedule.description,
                        startDate: schedule.startDate,
                        endDate: schedule.endDate,
                        location: schedule.location,
                      }}
                      mode="edit"
                      onSuccess={handleEditSuccess}
                      scheduleId={schedule.id}
                    />
                    <form action={deleteScheduleAction}>
                      <input type="hidden" name="gatheringId" value={gatheringId} />
                      <input type="hidden" name="scheduleId" value={schedule.id} />
                      <Button type="submit" variant="danger">
                        일정 삭제
                      </Button>
                    </form>
                  </div>
                ) : (
                  <dl className="grid gap-4">
                    <div className="flex flex-col gap-1">
                      <dt className="text-sm font-medium text-muted">
                        일정 날짜
                      </dt>
                      <dd className="font-medium">
                        {schedule.startDate} – {schedule.endDate}
                      </dd>
                    </div>

                    {schedule.location ? (
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-medium text-muted">
                          장소
                        </dt>
                        <dd>{schedule.location}</dd>
                      </div>
                    ) : null}

                    {schedule.authorName ? (
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-medium text-muted">
                          작성자
                        </dt>
                        <dd>
                          <UserInfo name={schedule.authorName} image={schedule.authorImage} />
                        </dd>
                      </div>
                    ) : null}

                    {schedule.description ? (
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-medium text-muted">
                          설명
                        </dt>
                        <dd className="whitespace-pre-wrap">{schedule.description}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </Modal.Body>
              {isAuthor || isEditing ? (
                <Modal.Footer>
                  {isEditing ? (
                    <Button variant="outline" onPress={() => setIsEditing(false)}>
                      취소
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onPress={() => setIsEditing(true)}
                    >
                      일정 수정
                    </Button>
                  )}
                </Modal.Footer>
              ) : null}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
