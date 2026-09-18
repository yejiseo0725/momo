'use client';

import { Button, CloseButton, Modal, Typography } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ScheduleForm from '@/app/gatherings/[id]/schedules/ScheduleForm';
import { deleteScheduleAction } from '@/app/gatherings/[id]/schedules/actions';

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
                <CloseButton
                  aria-label="닫기"
                  className="absolute top-4 right-4"
                  onPress={handleClose}
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
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Typography color="muted" type="body-sm" weight="medium">
                        일정 날짜
                      </Typography>
                      <p className="font-medium">
                        {schedule.startDate} – {schedule.endDate}
                      </p>
                    </div>

                    {schedule.location ? (
                      <div className="flex flex-col gap-1">
                        <Typography color="muted" type="body-sm" weight="medium">
                          장소
                        </Typography>
                        <p>{schedule.location}</p>
                      </div>
                    ) : null}

                    {schedule.authorName ? (
                      <div className="flex flex-col gap-1">
                        <Typography color="muted" type="body-sm" weight="medium">
                          작성자
                        </Typography>
                        <p>{schedule.authorName}</p>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-1">
                      <Typography color="muted" type="body-sm" weight="medium">
                        설명
                      </Typography>
                      <p className="whitespace-pre-wrap">{schedule.description}</p>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                {isEditing ? (
                  <Button variant="outline" onPress={() => setIsEditing(false)}>
                    취소
                  </Button>
                ) : (
                  <div className="flex w-full items-center justify-between gap-2">
                    {isAuthor ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onPress={() => setIsEditing(true)}
                      >
                        일정 수정
                      </Button>
                    ) : <span />}
                    <Button variant="outline" onPress={handleClose}>
                      닫기
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
